<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Throwable;

class AuthController extends Controller
{
    // ── POST /api/auth/login ──────────────────────────────────────────────────
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'phone'    => 'required|string',
            'password' => 'required|string',
        ]);

        try {
            $user = User::where('phone', $request->phone)
                ->whereNull('deleted_at')
                ->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                Log::warning('[AuthController] Login failed — invalid credentials', [
                    'phone'      => $request->phone,
                    'ip'         => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'datetime'   => now()->format('Y-m-d H:i:s.u'),
                ]);
                return $this->errorResponse('Invalid phone number or password.', 401);
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
                    'id'        => $user->id,
                    'name'      => $user->name,
                    'phone'     => $user->phone,
                    'email'     => $user->email,
                    'avatar'    => $user->avatar,
                    'user_type' => $user->user_type,
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
        $user = $request->user();
        return $this->successResponse([
            'user' => [
                'id'          => $user->id,
                'name'        => $user->name,
                'phone'       => $user->phone,
                'email'       => $user->email,
                'avatar'      => $user->avatar,
                'user_type'   => $user->user_type,
                'permissions' => $user->permissions,
            ],
        ]);
    }

    // ── POST /api/auth/change-password ────────────────────────────────────────
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->errorResponse('Current password is incorrect.', 422);
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
                'user_id' => $user->id,
                'error'   => $e->getMessage(),
                'datetime'=> now()->format('Y-m-d H:i:s.u'),
            ]);
            return $this->errorResponse('Failed to change password.', 500);
        }
    }
}
