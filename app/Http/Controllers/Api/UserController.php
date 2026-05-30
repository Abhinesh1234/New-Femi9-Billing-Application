<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Models\UserPermission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class UserController extends Controller
{
    // ── GET /api/users ────────────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'UserController::index');

        try {
            $perPage = max(1, min((int) $request->query('per_page', 100), 200));

            $paginated = User::select('id', 'name', 'email', 'phone', 'avatar', 'user_type', 'role_id', 'is_active', 'created_at')
                ->with(['role:id,name'])
                ->when($request->query('search'), fn ($q, $s) =>
                    $q->where(fn ($q2) =>
                        $q2->where('name',  'like', "%{$s}%")
                           ->orWhere('email', 'like', "%{$s}%")
                           ->orWhere('phone', 'like', "%{$s}%")
                    )
                )
                ->when($request->query('status') === 'active',   fn ($q) => $q->where('is_active', true))
                ->when($request->query('status') === 'inactive', fn ($q) => $q->where('is_active', false))
                ->orderBy('name')
                ->paginate($perPage);

            return $this->successResponse([
                'data'  => $paginated->items(),
                'total' => $paginated->total(),
                'meta'  => [
                    'current_page' => $paginated->currentPage(),
                    'last_page'    => $paginated->lastPage(),
                    'per_page'     => $paginated->perPage(),
                    'total'        => $paginated->total(),
                ],
            ]);

        } catch (Throwable $e) {
            $this->logException('UserController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch users.', 500);
        }
    }

    // ── GET /api/users/:id ────────────────────────────────────────────────────
    public function show(int $id): JsonResponse
    {
        $ctx = $this->buildCtx(request(), 'UserController::show');

        try {
            $user = User::select('id', 'name', 'email', 'phone', 'avatar', 'user_type', 'role_id', 'is_active', 'created_at', 'updated_at')
                ->with(['role:id,name', 'userPermissions', 'role.permissions'])
                ->findOrFail($id);

            $hasIndividual = $user->userPermissions->isNotEmpty();

            $individualPerms = $user->userPermissions->map(fn($p) => [
                'module'     => $p->module,
                'can_view'   => (bool) $p->can_view,
                'can_create' => (bool) $p->can_create,
                'can_edit'   => (bool) $p->can_edit,
                'can_delete' => (bool) $p->can_delete,
                'can_others' => (bool) $p->can_others,
                'others_data'=> $p->others_data ?? null,
            ])->values();

            $rolePerms = ($user->role?->permissions ?? collect())->map(fn($p) => [
                'module'     => $p->module,
                'can_view'   => (bool) $p->can_view,
                'can_create' => (bool) $p->can_create,
                'can_edit'   => (bool) $p->can_edit,
                'can_delete' => (bool) $p->can_delete,
                'can_others' => (bool) ($p->can_others ?? false),
                'others_data'=> $p->others_data ?? null,
            ])->values();

            $user->setAttribute('has_individual_permissions', $hasIndividual);
            $user->setRelation('permissions', $individualPerms);
            $user->setAttribute('role_permissions', $rolePerms);
            $user->unsetRelation('userPermissions');
            $user->role?->unsetRelation('permissions');

            return $this->successResponse(['data' => $user]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('User not found.', 404);
        } catch (Throwable $e) {
            $this->logException('UserController::show', $e, $ctx);
            return $this->errorResponse('Failed to fetch user.', 500);
        }
    }

    // ── POST /api/users ───────────────────────────────────────────────────────
    public function store(StoreUserRequest $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'UserController::store');

        try {
            $user = DB::transaction(function () use ($request) {
                $user = User::create([
                    'name'      => $request->name,
                    'email'     => $request->email ?? null,
                    'phone'     => $request->phone,
                    'password'  => $request->password,
                    'role_id'   => $request->role_id,
                    'user_type' => 'staff',
                    'is_active' => true,
                ]);

                $this->syncPermissions($user->id, $request->permissions ?? []);

                return $user;
            });

            return $this->successResponse(
                ['data' => ['id' => $user->id, 'name' => $user->name]],
                201
            );

        } catch (Throwable $e) {
            $this->logException('UserController::store', $e, $ctx);
            return $this->errorResponse('Failed to create user.', 500);
        }
    }

    // ── PUT /api/users/:id ────────────────────────────────────────────────────
    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'UserController::update');

        try {
            $user = User::findOrFail($id);

            DB::transaction(function () use ($request, $user) {
                $data = [
                    'name'    => $request->name,
                    'email'   => $request->email ?? null,
                    'phone'   => $request->phone,
                    'role_id' => $request->role_id,
                ];

                if ($request->filled('password')) {
                    $data['password'] = $request->password;
                }

                if ($request->has('is_active')) {
                    $data['is_active'] = $request->boolean('is_active');
                }

                $user->update($data);

                if ($request->has('permissions')) {
                    $this->syncPermissions($user->id, $request->permissions ?? []);
                }
            });

            return $this->successResponse(
                ['data' => ['id' => $user->id, 'name' => $user->name]]
            );

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('User not found.', 404);
        } catch (Throwable $e) {
            $this->logException('UserController::update', $e, $ctx);
            return $this->errorResponse('Failed to update user.', 500);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function syncPermissions(int $userId, array $permissions): void
    {
        UserPermission::where('user_id', $userId)->delete();

        if (empty($permissions)) return;

        $rows = array_map(fn ($perm) => [
            'user_id'     => $userId,
            'module'      => $perm['module'],
            'can_view'    => $perm['can_view']   ?? false,
            'can_create'  => $perm['can_create'] ?? false,
            'can_edit'    => $perm['can_edit']   ?? false,
            'can_delete'  => $perm['can_delete'] ?? false,
            'can_others'  => false,
            'others_data' => isset($perm['others_data']) ? json_encode($perm['others_data']) : null,
            'created_at'  => now(),
            'updated_at'  => now(),
        ], $permissions);

        UserPermission::insert($rows);
    }
}
