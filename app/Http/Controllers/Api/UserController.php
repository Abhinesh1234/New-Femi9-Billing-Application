<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class UserController extends Controller
{
    // ── GET /api/users ────────────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'UserController::index');

        try {
            $users = User::select('id', 'name', 'email', 'avatar', 'user_type', 'is_active')
                ->when($request->query('search'), fn ($q, $s) =>
                    $q->where(fn ($q2) =>
                        $q2->where('name',  'like', "%{$s}%")
                           ->orWhere('email', 'like', "%{$s}%")
                    )
                )
                ->when(!$request->boolean('all'), fn ($q) => $q->active())
                ->orderBy('name')
                ->get();

            return $this->successResponse(['data' => $users]);

        } catch (Throwable $e) {
            $this->logException('UserController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch users.', 500);
        }
    }
}
