<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoleRequest;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class RoleController extends Controller
{
    // ── GET /api/roles ────────────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'RoleController::index');
        try {
            $perPage = max(1, min((int) $request->query('per_page', 50), 200));

            $query = Role::select(['id', 'name', 'description', 'is_system', 'created_by', 'created_at'])
                ->with('createdBy:id,name')
                ->withCount('permissions')
                ->when($request->filled('search'), fn ($q) =>
                    $q->where('name', 'like', '%' . $request->query('search') . '%')
                )
                ->when($request->boolean('trashed'), fn ($q) => $q->onlyTrashed())
                ->orderBy('name');

            return $this->successResponse(['data' => $query->paginate($perPage)]);
        } catch (Throwable $e) {
            $this->logException('RoleController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch roles.', 500);
        }
    }

    // ── POST /api/roles ───────────────────────────────────────────────────────
    public function store(StoreRoleRequest $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'RoleController::store');
        try {
            $userId = $request->user()?->id;
            $data   = $request->validated();

            DB::beginTransaction();

            $role = Role::create([
                'name'        => $data['name'],
                'description' => $data['description'] ?? null,
                'created_by'  => $userId,
                'updated_by'  => $userId,
            ]);

            $this->syncPermissions($role->id, $data['permissions'] ?? []);

            DB::commit();

            Log::info('[Role] Created', array_merge($ctx, ['id' => $role->id]));

            return $this->successResponse([
                'message' => 'Role created.',
                'data'    => $role->load('permissions'),
            ], 201);
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('RoleController::store', $e, $ctx);
            return $this->errorResponse('Failed to create role.', 500);
        }
    }

    // ── GET /api/roles/{role} ─────────────────────────────────────────────────
    public function show(Request $request, Role $role): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'RoleController::show');
        try {
            $role->loadCount('permissions')->load(['permissions', 'createdBy:id,name']);
            return $this->successResponse(['data' => $role]);
        } catch (Throwable $e) {
            $this->logException('RoleController::show', $e, $ctx);
            return $this->errorResponse('Failed to fetch role.', 500);
        }
    }

    // ── PUT /api/roles/{role} ─────────────────────────────────────────────────
    public function update(StoreRoleRequest $request, Role $role): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'RoleController::update');
        try {
            if ($role->is_system) {
                return $this->errorResponse('System roles cannot be modified.', 403);
            }

            $userId = $request->user()?->id;
            $data   = $request->validated();

            DB::beginTransaction();

            $role->update([
                'name'        => $data['name'],
                'description' => $data['description'] ?? null,
                'updated_by'  => $userId,
            ]);

            $this->syncPermissions($role->id, $data['permissions'] ?? []);

            DB::commit();

            Log::info('[Role] Updated', array_merge($ctx, ['id' => $role->id]));

            return $this->successResponse([
                'message' => 'Role updated.',
                'data'    => $role->fresh()->load('permissions'),
            ]);
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('RoleController::update', $e, $ctx);
            return $this->errorResponse('Failed to update role.', 500);
        }
    }

    // ── DELETE /api/roles/{role} ──────────────────────────────────────────────
    public function destroy(Request $request, Role $role): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'RoleController::destroy');
        try {
            if ($role->is_system) {
                return $this->errorResponse('System roles cannot be deleted.', 403);
            }

            $role->delete();
            Log::info('[Role] Deleted', array_merge($ctx, ['id' => $role->id]));
            return $this->successResponse(['message' => 'Role deleted.']);
        } catch (Throwable $e) {
            $this->logException('RoleController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete role.', 500);
        }
    }

    // ── Sync permissions (upsert) ─────────────────────────────────────────────
    private function syncPermissions(int $roleId, array $permissions): void
    {
        // Delete all existing permissions and replace — clean upsert
        \App\Models\RolePermission::where('role_id', $roleId)->delete();

        foreach ($permissions as $perm) {
            \App\Models\RolePermission::create([
                'role_id'    => $roleId,
                'module'     => $perm['module'],
                'can_view'   => (bool) ($perm['can_view']   ?? false),
                'can_create' => (bool) ($perm['can_create'] ?? false),
                'can_edit'   => (bool) ($perm['can_edit']   ?? false),
                'can_delete' => (bool) ($perm['can_delete'] ?? false),
                'can_others'  => (bool) ($perm['can_others'] ?? false),
                'others_data' => $perm['others_data'] ?? null,
            ]);
        }
    }
}
