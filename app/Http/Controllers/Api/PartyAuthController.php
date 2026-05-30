<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Party;
use App\Models\PartyUser;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\RateLimiter;
use Throwable;

class PartyAuthController extends Controller
{
    public function __construct(private readonly SettingService $settings) {}
    // ── POST /api/party/auth/login ────────────────────────────────────────────
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'login'    => ['required', 'string'],   // email or mobile
            'password' => ['required', 'string'],
        ], [
            'login.required'    => 'Email or mobile number is required.',
            'password.required' => 'Password is required.',
        ]);

        $throttleKey = 'party_login:' . hash('sha256', $request->login . $request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            $minutes = (int) ceil($seconds / 60);
            return $this->errorResponse(
                "Too many failed login attempts. Try again in {$minutes} minute(s).",
                429
            );
        }

        try {
            // Find ALL party_users matching username, email, or mobile
            $candidates = PartyUser::where(function ($q) use ($request) {
                $q->where('username', $request->login)
                  ->orWhere('email',    $request->login)
                  ->orWhere('mobile',   $request->login);
            })->whereNull('deleted_at')->get();

            // Filter to those where the password is correct
            $matched = $candidates->filter(fn($u) => Hash::check($request->password, $u->password));

            if ($matched->isEmpty()) {
                RateLimiter::hit($throttleKey, 900);
                $remaining = 5 - RateLimiter::attempts($throttleKey);

                Log::warning('[PartyAuthController] Login failed — invalid credentials', [
                    'login'              => substr($request->login, 0, 4) . '****',
                    'ip'                 => $request->ip(),
                    'attempts_remaining' => max(0, $remaining),
                    'datetime'           => now()->format('Y-m-d H:i:s.u'),
                ]);

                $msg = $remaining > 0
                    ? "Invalid credentials. {$remaining} attempt(s) remaining before lockout."
                    : 'Invalid credentials.';

                return $this->errorResponse($msg, 401);
            }

            RateLimiter::clear($throttleKey);

            // If exactly one valid match — log in directly
            if ($matched->count() === 1) {
                $partyUser = $matched->first();
                return $this->doLogin($partyUser, $request);
            }

            // Multiple valid matches — return pending with category list
            // Sort so last-used category appears first
            $categories = $matched
                ->sortByDesc(fn($u) => $u->last_login_at?->timestamp ?? 0)
                ->map(fn($pu) => $this->buildCategoryEntry($pu, null))
                ->values();

            Log::info('[PartyAuthController] Login pending — multiple categories', [
                'login'    => substr($request->login, 0, 4) . '****',
                'count'    => $matched->count(),
                'ip'       => $request->ip(),
                'datetime' => now()->format('Y-m-d H:i:s.u'),
            ]);

            return $this->successResponse([
                'user_type'  => 'party_pending',
                'categories' => $categories,
            ]);

        } catch (Throwable $e) {
            $this->logException('PartyAuthController::login', $e, $this->buildCtx($request, 'PartyAuthController::login'));
            return $this->errorResponse('Login failed. Please try again.', 500);
        }
    }

    // ── POST /api/party/auth/select ───────────────────────────────────────────
    // Called after category picker when login returned party_pending.
    // Re-validates credentials + issues token for the chosen party_user.
    public function select(Request $request): JsonResponse
    {
        $request->validate([
            'login'         => ['required', 'string'],
            'password'      => ['required', 'string'],
            'party_user_id' => ['required', 'integer'],
        ]);

        $throttleKey = 'party_login:' . hash('sha256', $request->login . $request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            $minutes = (int) ceil($seconds / 60);
            return $this->errorResponse(
                "Too many failed login attempts. Try again in {$minutes} minute(s).",
                429
            );
        }

        try {
            $partyUser = PartyUser::whereNull('deleted_at')->find($request->party_user_id);

            if (!$partyUser) {
                return $this->errorResponse('Invalid selection.', 404);
            }

            // Verify the login matches this party_user's username, email, or mobile
            $loginMatches = ($partyUser->username === $request->login)
                         || ($partyUser->mobile   === $request->login)
                         || ($partyUser->email    === $request->login);

            if (!$loginMatches || !Hash::check($request->password, $partyUser->password)) {
                RateLimiter::hit($throttleKey, 900);
                return $this->errorResponse('Invalid credentials.', 401);
            }

            RateLimiter::clear($throttleKey);

            return $this->doLogin($partyUser, $request);

        } catch (Throwable $e) {
            $this->logException('PartyAuthController::select', $e, $this->buildCtx($request, 'PartyAuthController::select'));
            return $this->errorResponse('Selection failed. Please try again.', 500);
        }
    }

    // ── POST /api/party/auth/switch ───────────────────────────────────────────
    // Authenticated party user switches to a different distribution category.
    // The target party_user must share the same mobile number.
    public function switchCategory(Request $request): JsonResponse
    {
        $request->validate([
            'party_user_id' => ['required', 'integer'],
        ]);

        try {
            $currentUser = $request->user();

            $target = PartyUser::whereNull('deleted_at')->find($request->party_user_id);

            if (!$target) {
                return $this->errorResponse('Target account not found.', 404);
            }

            // Security: target must share the same mobile as the current user
            if (!$currentUser->mobile || $target->mobile !== $currentUser->mobile) {
                return $this->errorResponse('Cannot switch to this account.', 403);
            }

            if (!$target->is_active) {
                return $this->errorResponse('Target account is inactive.', 403);
            }

            $party = $target->party()->withTrashed()->first();

            if (!$party || $party->deleted_at) {
                return $this->errorResponse('The party account no longer exists.', 403);
            }

            if (!$party->enable_portal) {
                return $this->errorResponse('Portal access is not enabled for this account.', 403);
            }

            if (!$party->is_active) {
                return $this->errorResponse('This party account is inactive.', 403);
            }

            // Revoke current token and issue a new one for the target
            $currentUser->currentAccessToken()->delete();
            $token = $target->createToken('party_portal_token')->plainTextToken;
            $target->update(['last_login_at' => now()]);

            Log::info('[PartyAuthController] Category switched', [
                'from_party_user_id' => $currentUser->id,
                'to_party_user_id'   => $target->id,
                'ip'                 => $request->ip(),
                'datetime'           => now()->format('Y-m-d H:i:s.u'),
            ]);

            $allCategories = $this->loadAllCategories($target->mobile, $target->id);

            return $this->successResponse([
                'token'      => $token,
                'token_type' => 'Bearer',
                'user'       => $this->buildUserPayload($target, $party, $allCategories),
            ]);

        } catch (Throwable $e) {
            $this->logException('PartyAuthController::switchCategory', $e, $this->buildCtx($request, 'PartyAuthController::switchCategory'));
            return $this->errorResponse('Category switch failed. Please try again.', 500);
        }
    }

    // ── POST /api/party/auth/logout ───────────────────────────────────────────
    public function logout(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $user?->currentAccessToken()?->delete();
            Log::info('[PartyAuthController] Logout', [
                'party_user_id' => $user?->id,
                'ip'            => $request->ip(),
                'datetime'      => now()->format('Y-m-d H:i:s.u'),
            ]);
            return $this->successResponse(['message' => 'Logged out successfully.']);
        } catch (Throwable $e) {
            Log::error('[PartyAuthController] Logout failed', ['error' => $e->getMessage()]);
            return $this->errorResponse('Logout failed.', 500);
        }
    }

    // ── GET /api/party/auth/me ────────────────────────────────────────────────
    public function me(Request $request): JsonResponse
    {
        try {
            $partyUser = $request->user();
            $party     = $partyUser->party()->withTrashed()->first();

            $allCategories = $this->loadAllCategories($partyUser->mobile, $partyUser->id);

            return $this->successResponse([
                'user' => $this->buildUserPayload($partyUser, $party, $allCategories),
            ]);
        } catch (Throwable $e) {
            $this->logException('PartyAuthController::me', $e, $this->buildCtx($request, 'PartyAuthController::me'));
            return $this->errorResponse('Failed to fetch profile.', 500);
        }
    }

    // ── POST /api/party/auth/change-password ──────────────────────────────────
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'new_password'     => [
                'required', 'string', 'min:8', 'confirmed',
                'regex:/[A-Z]/',
                'regex:/[0-9]/',
                'regex:/[\W_]/',
            ],
        ], [
            'new_password.regex' => 'Password must contain an uppercase letter, a number, and a special character.',
            'new_password.min'   => 'Password must be at least 8 characters.',
        ]);

        $partyUser = $request->user();

        if (!Hash::check($request->current_password, $partyUser->password)) {
            return $this->errorResponse('Current password is incorrect.', 422);
        }

        if (Hash::check($request->new_password, $partyUser->password)) {
            return $this->errorResponse('New password must be different from the current password.', 422);
        }

        try {
            $partyUser->update(['password' => Hash::make($request->new_password)]);
            $partyUser->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();

            return $this->successResponse(['message' => 'Password changed successfully.']);
        } catch (Throwable $e) {
            Log::error('[PartyAuthController] Password change failed', [
                'party_user_id' => $partyUser->id,
                'error'         => $e->getMessage(),
            ]);
            return $this->errorResponse('Failed to change password.', 500);
        }
    }

    // ── POST /api/party/auth/avatar ───────────────────────────────────────────
    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|file|mimes:jpeg,jpg,png,webp|max:5120',
        ]);

        try {
            $partyUser = $request->user();
            $party     = $partyUser->party()->withTrashed()->first();

            if (!$party || $party->deleted_at) {
                return $this->errorResponse('Party account not found.', 404);
            }

            if ($party->party_image) {
                Storage::disk('public')->delete($party->party_image);
            }

            $ext      = $request->file('image')->getClientOriginalExtension() ?: 'jpg';
            $filename = 'parties/images/' . \Illuminate\Support\Str::uuid() . '.' . $ext;
            Storage::disk('public')->put($filename, file_get_contents($request->file('image')->getRealPath()));

            $party->update(['party_image' => $filename]);
            $party->refresh();

            $allCategories = $this->loadAllCategories($partyUser->mobile, $partyUser->id);

            return $this->successResponse([
                'user' => $this->buildUserPayload($partyUser, $party, $allCategories),
            ]);
        } catch (Throwable $e) {
            $this->logException('PartyAuthController::updateAvatar', $e, $this->buildCtx($request, 'PartyAuthController::updateAvatar'));
            return $this->errorResponse('Failed to upload image.', 500);
        }
    }

    // ── DELETE /api/party/auth/avatar ─────────────────────────────────────────
    public function removeAvatar(Request $request): JsonResponse
    {
        try {
            $partyUser = $request->user();
            $party     = $partyUser->party()->withTrashed()->first();

            if (!$party || $party->deleted_at) {
                return $this->errorResponse('Party account not found.', 404);
            }

            if ($party->party_image) {
                Storage::disk('public')->delete($party->party_image);
                $party->update(['party_image' => null]);
                $party->refresh();
            }

            $allCategories = $this->loadAllCategories($partyUser->mobile, $partyUser->id);

            return $this->successResponse([
                'user' => $this->buildUserPayload($partyUser, $party, $allCategories),
            ]);
        } catch (Throwable $e) {
            $this->logException('PartyAuthController::removeAvatar', $e, $this->buildCtx($request, 'PartyAuthController::removeAvatar'));
            return $this->errorResponse('Failed to remove image.', 500);
        }
    }

    // ── PUT /api/party/auth/organisation ─────────────────────────────────────
    public function updateOrganisation(Request $request): JsonResponse
    {
        $request->validate([
            'display_name' => ['required', 'string', 'max:255'],
        ]);

        try {
            $partyUser = $request->user();
            $party     = $partyUser->party()->withTrashed()->first();

            if (!$party || $party->deleted_at) {
                return $this->errorResponse('Party account not found.', 404);
            }

            $party->update(['display_name' => $request->display_name]);
            $party->refresh();

            $allCategories = $this->loadAllCategories($partyUser->mobile, $partyUser->id);

            return $this->successResponse([
                'user' => $this->buildUserPayload($partyUser, $party, $allCategories),
            ]);
        } catch (Throwable $e) {
            $this->logException('PartyAuthController::updateOrganisation', $e, $this->buildCtx($request, 'PartyAuthController::updateOrganisation'));
            return $this->errorResponse('Failed to update organisation name.', 500);
        }
    }

    // ── POST /api/party/auth/location/{id}/logo ───────────────────────────────
    public function updateLocationLogo(Request $request, int $locationId): JsonResponse
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        try {
            $location = $this->ownedLocation($request, $locationId);
            if ($location instanceof JsonResponse) return $location;

            if ($location->logo_path && $location->logo_type === 'custom') {
                Storage::disk('public')->delete($location->logo_path);
            }

            $path = $request->file('logo')->store('locations/logos', 'public');
            $location->update(['logo_type' => 'custom', 'logo_path' => $path]);

            return $this->locationUpdatedResponse($request, $location);
        } catch (Throwable $e) {
            $this->logException('PartyAuthController::updateLocationLogo', $e, $this->buildCtx($request, 'PartyAuthController::updateLocationLogo'));
            return $this->errorResponse('Failed to upload logo.', 500);
        }
    }

    // ── DELETE /api/party/auth/location/{id}/logo ─────────────────────────────
    public function removeLocationLogo(Request $request, int $locationId): JsonResponse
    {
        try {
            $location = $this->ownedLocation($request, $locationId);
            if ($location instanceof JsonResponse) return $location;

            if ($location->logo_path && $location->logo_type === 'custom') {
                Storage::disk('public')->delete($location->logo_path);
            }
            $location->update(['logo_type' => 'org', 'logo_path' => null]);

            return $this->locationUpdatedResponse($request, $location);
        } catch (Throwable $e) {
            $this->logException('PartyAuthController::removeLocationLogo', $e, $this->buildCtx($request, 'PartyAuthController::removeLocationLogo'));
            return $this->errorResponse('Failed to remove logo.', 500);
        }
    }

    // ── PUT /api/party/auth/location/{id}/address ─────────────────────────────
    public function updateLocationAddress(Request $request, int $locationId): JsonResponse
    {
        $addrRules = [
            'nullable', 'array',
        ];
        $request->validate([
            'billing'  => $addrRules,
            'shipping' => $addrRules,
        ]);

        try {
            $location = $this->ownedLocation($request, $locationId);
            if ($location instanceof JsonResponse) return $location;

            $updates = [];
            if ($request->has('billing'))  $updates['address']          = $request->billing  ?: null;
            if ($request->has('shipping')) $updates['shipping_address'] = $request->shipping ?: null;

            $location->update($updates);

            return $this->locationUpdatedResponse($request, $location);
        } catch (Throwable $e) {
            $this->logException('PartyAuthController::updateLocationAddress', $e, $this->buildCtx($request, 'PartyAuthController::updateLocationAddress'));
            return $this->errorResponse('Failed to update address.', 500);
        }
    }

    // ── Private: verify location ownership ───────────────────────────────────
    private function ownedLocation(Request $request, int $locationId): \App\Models\Location|JsonResponse
    {
        $party = $request->user()->party()->withTrashed()->first();
        if (!$party || $party->deleted_at) {
            return $this->errorResponse('Party account not found.', 404);
        }
        $location = \App\Models\Location::where('id', $locationId)
            ->where('party_id', $party->id)
            ->whereNull('deleted_at')
            ->first();
        if (!$location) {
            return $this->errorResponse('Location not found.', 404);
        }
        return $location;
    }

    // ── Private: rebuild user payload after location change ───────────────────
    private function locationUpdatedResponse(Request $request, \App\Models\Location $location): JsonResponse
    {
        $partyUser = $request->user();
        $party     = $partyUser->party()->withTrashed()->first();
        $party->refresh();
        $allCategories = $this->loadAllCategories($partyUser->mobile, $partyUser->id);
        return $this->successResponse([
            'user' => $this->buildUserPayload($partyUser, $party, $allCategories),
        ]);
    }

    // ── PUT /api/party/auth/banking ───────────────────────────────────────────
    public function updateBanking(Request $request): JsonResponse
    {
        $request->validate([
            'account_number' => ['nullable', 'string', 'max:50'],
            'ifsc_code'      => ['nullable', 'string', 'max:20'],
            'upi_number'     => ['nullable', 'string', 'max:50'],
        ]);

        try {
            $partyUser = $request->user();
            $party     = $partyUser->party()->withTrashed()->first();

            if (!$party || $party->deleted_at) {
                return $this->errorResponse('Party account not found.', 404);
            }

            $party->update([
                'account_number' => $request->input('account_number'),
                'ifsc_code'      => $request->input('ifsc_code'),
                'upi_number'     => $request->input('upi_number'),
            ]);

            $allCategories = $this->loadAllCategories($partyUser->mobile, $partyUser->id);
            $party->refresh();

            return $this->successResponse([
                'user' => $this->buildUserPayload($partyUser, $party, $allCategories),
            ]);
        } catch (Throwable $e) {
            $this->logException('PartyAuthController::updateBanking', $e, $this->buildCtx($request, 'PartyAuthController::updateBanking'));
            return $this->errorResponse('Failed to update banking details.', 500);
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function doLogin(PartyUser $partyUser, Request $request): JsonResponse
    {
        if (!$partyUser->is_active) {
            return $this->errorResponse('Your portal account has been deactivated. Please contact your account manager.', 403);
        }

        $party = $partyUser->party()->withTrashed()->first();

        if (!$party || $party->deleted_at) {
            return $this->errorResponse('The party account no longer exists. Please contact support.', 403);
        }

        if (!$party->enable_portal) {
            return $this->errorResponse('Portal access is not enabled for this account. Please contact your account manager.', 403);
        }

        if (!$party->is_active) {
            return $this->errorResponse('This party account is inactive. Please contact your account manager.', 403);
        }

        // Revoke old tokens and issue a fresh one
        $partyUser->tokens()->delete();
        $token = $partyUser->createToken('party_portal_token')->plainTextToken;
        $partyUser->update(['last_login_at' => now()]);

        Log::info('[PartyAuthController] Login success', [
            'party_user_id' => $partyUser->id,
            'party_id'      => $partyUser->party_id,
            'ip'            => $request->ip(),
            'datetime'      => now()->format('Y-m-d H:i:s.u'),
        ]);

        $allCategories = $this->loadAllCategories($partyUser->mobile, $partyUser->id);

        return $this->successResponse([
            'token'      => $token,
            'token_type' => 'Bearer',
            'user'       => $this->buildUserPayload($partyUser, $party, $allCategories),
        ]);
    }

    private function loadAllCategories(?string $mobile, int $activePartyUserId): array
    {
        if (!$mobile) {
            return [];
        }

        return PartyUser::where('mobile', $mobile)
            ->whereNull('deleted_at')
            ->where('is_active', true)
            ->with('party.distributionCategory')
            ->get()
            ->filter(fn($pu) => $pu->party && $pu->party->enable_portal && !$pu->party->deleted_at)
            ->map(fn($pu) => $this->buildCategoryEntry($pu, $activePartyUserId))
            ->values()
            ->toArray();
    }

    private function buildCategoryEntry(PartyUser $pu, ?int $activePartyUserId): array
    {
        $party = $pu->relationLoaded('party') ? $pu->party : $pu->party()->withTrashed()->first();
        return [
            'party_user_id' => $pu->id,
            'party_id'      => $pu->party_id,
            'party_name'    => $party?->display_name,
            'category_id'   => $party?->distribution_category_id,
            'category_name' => optional($party?->distributionCategory)->name,
            'last_login_at' => $pu->last_login_at?->toIso8601String(),
            'is_active'     => $activePartyUserId !== null && $pu->id === $activePartyUserId,
        ];
    }

    private function buildUserPayload(PartyUser $partyUser, ?Party $party, array $categories): array
    {
        $productSettings = $this->settings->get('products') ?? [];

        return [
            'id'            => $partyUser->id,
            'party_id'      => $partyUser->party_id,
            'party_code'    => $party?->party_id,   // string ID e.g. femi9-ss-001
            'name'          => $partyUser->name,
            'phone'         => $partyUser->mobile ?? '',   // unified shape with admin AuthUser
            'email'         => $partyUser->email,
            'mobile'        => $partyUser->mobile,
            'avatar'        => $party?->party_image,
            'avatar_url'    => ($party?->party_image)
                                   ? Storage::disk('public')->url($party->party_image)
                                   : null,
            'user_type'     => 'party',
            'role_id'       => $partyUser->role_id,
            'role_name'     => $partyUser->role?->name,
            'permissions'   => (object) ($partyUser->computeEffectivePermissions() ?? []),
            'party_name'      => $party?->display_name,
            'party_type'      => optional($party?->distributionCategory)->party_type,
            'category_id'     => $party?->distribution_category_id,
            'category_name'   => optional($party?->distributionCategory)->name,
            'last_login_at'   => $partyUser->last_login_at?->toIso8601String(),
            'account_number'  => $party?->account_number,
            'ifsc_code'       => $party?->ifsc_code,
            'upi_number'      => $party?->upi_number,
            'locations'       => $party
                ? \App\Models\Location::where('party_id', $party->id)
                    ->whereNull('deleted_at')
                    ->where('is_active', true)
                    ->orderBy('is_primary', 'desc')
                    ->orderBy('name')
                    ->get()
                    ->map(fn($l) => [
                        'id'               => $l->id,
                        'name'             => $l->name,
                        'type'             => $l->type,
                        'is_primary'       => (bool) $l->is_primary,
                        'logo_type'        => $l->logo_type,
                        'logo_path'        => $l->logo_path,
                        'logo_url'         => $l->logo_path
                                                 ? Storage::disk('public')->url($l->logo_path)
                                                 : null,
                        'address'          => $l->address,
                        'shipping_address' => $l->shipping_address,
                    ])
                    ->values()
                : [],
            'categories'      => $categories,
            'settings'        => [
                'enable_composite_items' => (bool) ($productSettings['enable_composite_items'] ?? false),
                'enable_price_lists'     => (bool) ($productSettings['enable_price_lists'] ?? false),
            ],
        ];
    }
}
