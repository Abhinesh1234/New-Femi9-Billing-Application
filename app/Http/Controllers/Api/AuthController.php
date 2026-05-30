<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Throwable;

class AuthController extends Controller
{
    public function __construct(private readonly SettingService $settings) {}
    // ── POST /api/auth/login ──────────────────────────────────────────────────
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'phone'    => ['required', 'string', 'regex:/^[\d\+\-\(\)\s]{7,20}$/'],
            'password' => ['required', 'string'],
        ]);

        // ── Account lockout: max 5 failed attempts, lock 15 min ───────────────
        $throttleKey = 'login:' . hash('sha256', $request->phone . $request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            $minutes = (int) ceil($seconds / 60);
            Log::warning('[AuthController] Login blocked — rate limited', [
                'phone'      => substr($request->phone, 0, 4) . '****',
                'ip'         => $request->ip(),
                'retry_in_s' => $seconds,
                'datetime'   => now()->format('Y-m-d H:i:s.u'),
            ]);
            return $this->errorResponse(
                "Too many failed login attempts. Try again in {$minutes} minute(s).",
                429
            );
        }

        try {
            $user = User::where('phone', $request->phone)
                ->whereNull('deleted_at')
                ->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                // Increment attempt counter; lock for 900 s (15 min) after 5 failures
                RateLimiter::hit($throttleKey, 900);

                $remaining = 5 - RateLimiter::attempts($throttleKey);
                Log::warning('[AuthController] Login failed — invalid credentials', [
                    'phone'      => substr($request->phone, 0, 4) . '****',
                    'ip'         => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'attempts_remaining' => max(0, $remaining),
                    'datetime'   => now()->format('Y-m-d H:i:s.u'),
                ]);

                $msg = $remaining > 0
                    ? "Invalid phone number or password. {$remaining} attempt(s) remaining before lockout."
                    : 'Invalid phone number or password.';

                return $this->errorResponse($msg, 401);
            }

            if (!$user->is_active) {
                Log::warning('[AuthController] Login blocked — account deactivated', [
                    'user_id'    => $user->id,
                    'ip'         => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'datetime'   => now()->format('Y-m-d H:i:s.u'),
                ]);
                return $this->errorResponse('Your account has been deactivated. Please contact an administrator.', 403);
            }

            // Successful login — clear the throttle counter
            RateLimiter::clear($throttleKey);

            // Revoke all previous tokens and issue a fresh one
            $user->tokens()->delete();
            $token = $user->createToken('auth_token')->plainTextToken;

            Log::info('[AuthController] Login success', [
                'user_id'    => $user->id,
                'ip'         => $request->ip(),
                'user_agent' => $request->userAgent(),
                'datetime'   => now()->format('Y-m-d H:i:s.u'),
            ]);

            return $this->successResponse([
                'token'      => $token,
                'token_type' => 'Bearer',
                'user'       => [
                    'id'          => $user->id,
                    'name'        => $user->name,
                    'phone'       => $user->phone,
                    'email'       => $user->email,
                    'avatar'      => $user->avatar,
                    'user_type'   => $user->user_type,
                    'role_id'     => $user->role_id,
                    'role_name'   => $user->role?->name,
                    // null = full access; individual rows override even super_admin
                    'permissions' => $user->computeEffectivePermissions(),
                    'settings'    => $this->featureSettings(),
                ],
            ]);

        } catch (Throwable $e) {
            $this->logException('AuthController::login', $e, $this->buildCtx($request, 'AuthController::login'));
            return $this->errorResponse('Login failed. Please try again.', 500);
        }
    }

    // ── POST /api/auth/logout ─────────────────────────────────────────────────
    public function logout(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $user?->currentAccessToken()?->delete();
            Log::info('[AuthController] Logout', [
                'user_id'  => $user?->id,
                'ip'       => $request->ip(),
                'datetime' => now()->format('Y-m-d H:i:s.u'),
            ]);
            return $this->successResponse(['message' => 'Logged out successfully.']);
        } catch (Throwable $e) {
            Log::error('[AuthController] Logout failed', ['error' => $e->getMessage()]);
            return $this->errorResponse('Logout failed.', 500);
        }
    }

    // ── GET /api/auth/me ──────────────────────────────────────────────────────
    public function me(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            return $this->successResponse([
                'user' => [
                    'id'          => $user->id,
                    'name'        => $user->name,
                    'phone'       => $user->phone,
                    'email'       => $user->email,
                    'avatar'      => $user->avatar,
                    'user_type'   => $user->user_type,
                    'role_id'     => $user->role_id,
                    'role_name'   => $user->role?->name,
                    'permissions' => $user->computeEffectivePermissions(),
                    'settings'    => $this->featureSettings(),
                ],
            ]);
        } catch (Throwable $e) {
            $this->logException('AuthController::me', $e, $this->buildCtx($request, 'AuthController::me'));
            return $this->errorResponse('Failed to fetch user profile.', 500);
        }
    }

    // ── POST /api/auth/change-password ────────────────────────────────────────
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'new_password'     => [
                'required', 'string', 'min:8', 'confirmed',
                'regex:/[A-Z]/',   // at least one uppercase letter
                'regex:/[0-9]/',   // at least one digit
                'regex:/[\W_]/',   // at least one special character
            ],
        ], [
            'new_password.regex' => 'Password must be at least 8 characters and contain an uppercase letter, a number, and a special character.',
            'new_password.min'   => 'Password must be at least 8 characters.',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->errorResponse('Current password is incorrect.', 422);
        }

        if (Hash::check($request->new_password, $user->password)) {
            return $this->errorResponse('New password must be different from the current password.', 422);
        }

        try {
            $user->update(['password' => Hash::make($request->new_password)]);
            // Revoke all other tokens (keep current session alive)
            $user->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();

            Log::info('[AuthController] Password changed', [
                'user_id'    => $user->id,
                'ip'         => $request->ip(),
                'user_agent' => $request->userAgent(),
                'datetime'   => now()->format('Y-m-d H:i:s.u'),
            ]);

            return $this->successResponse(['message' => 'Password changed successfully.']);
        } catch (Throwable $e) {
            Log::error('[AuthController] Password change failed', [
                'user_id'  => $user->id,
                'error'    => $e->getMessage(),
                'datetime' => now()->format('Y-m-d H:i:s.u'),
            ]);
            return $this->errorResponse('Failed to change password.', 500);
        }
    }

    private function featureSettings(): array
    {
        $p = $this->settings->get('products') ?? [];
        return [
            'enable_composite_items' => (bool) ($p['enable_composite_items'] ?? false),
            'enable_price_lists'     => (bool) ($p['enable_price_lists']     ?? false),
        ];
    }
}
