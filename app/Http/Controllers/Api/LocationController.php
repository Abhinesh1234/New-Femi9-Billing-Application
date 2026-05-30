<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLocationRequest;
use App\Http\Requests\UpdateLocationRequest;
use App\Models\AuditLog;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class LocationController extends Controller
{
    // ── GET /api/locations ────────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'LocationController::index');

        try {
            $perPage      = max(1, min((int) $request->query('per_page', 500), 1000));
            $partyScopeId = $request->attributes->get('party_scope_id');

            $query = Location::select([
                    'id', 'party_id', 'name', 'type', 'parent_id',
                    'logo_type', 'logo_path', 'is_active', 'is_primary',
                    'address', 'default_txn_series_id',
                    'created_by', 'created_at',
                ])
                ->with([
                    'parent:id,name',
                    'createdBy:id,name,phone',
                    'defaultTxnSeries:id,name',
                ])
                ->when(
                    $request->boolean('all_locations'),
                    fn($q) => $q, // no party_id constraint — return all locations
                    fn($q) => $q->when(
                        $partyScopeId !== null,
                        fn($q2) => $q2->where('party_id', $partyScopeId), // party portal: their own locations
                        fn($q2) => $q2->when(
                            $request->filled('party_id'),
                            fn($q3) => $q3->where('party_id', $request->query('party_id')),
                            fn($q3) => $q3->whereNull('party_id') // default: company-owned only
                        )
                    )
                )
                ->search($request->query('search'))
                ->ofType($request->query('type'))
                ->when($request->boolean('active_only'), fn($q) => $q->active())
                ->when($request->boolean('trashed'),     fn($q) => $q->onlyTrashed())
                ->orderBy('name');

            $paginated = $query->paginate($perPage);

            return response()->json(array_merge(['success' => true], [
                'data' => $paginated->items(),
                'meta' => [
                    'current_page' => $paginated->currentPage(),
                    'last_page'    => $paginated->lastPage(),
                    'total'        => $paginated->total(),
                    'per_page'     => $paginated->perPage(),
                ],
            ]))
            ->header('Cache-Control', 'private, no-cache');

        } catch (Throwable $e) {
            $this->logException('LocationController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch locations.', 500);
        }
    }

    // ── POST /api/locations ───────────────────────────────────────────────────
    public function store(StoreLocationRequest $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'LocationController::store');

        try {
            $location = null;

            DB::beginTransaction();

            $data = $request->validated();
            $data['created_by'] = $request->user()->id;
            $location = Location::create($data);

            DB::commit();

            Log::info('[LocationController] Created', array_merge($ctx, ['location_id' => $location->id]));

            try {
                $this->audit($request, 'created', $location->id, null, $location->toArray());
            } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }

            return $this->successResponse([
                'message' => 'Location created.',
                'data'    => $location->load(['defaultTxnSeries:id,name', 'createdBy:id,name,phone']),
            ], 201);

        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('LocationController::store', $e, $ctx);
            return $this->errorResponse('Failed to create location.', 500);
        }
    }

    // ── GET /api/locations/{id} ───────────────────────────────────────────────
    public function show(Request $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'LocationController::show');

        try {
            $location = Location::withTrashed()->with([
                    'parent:id,name',
                    'children:id,name,type,parent_id',
                    'defaultTxnSeries:id,name',
                    'createdBy:id,name,phone',
                ])
                ->findOrFail($id);

            return $this->successResponse(['data' => $location]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Location not found.', 404);
        } catch (Throwable $e) {
            $this->logException('LocationController::show', $e, $ctx);
            return $this->errorResponse('Failed to fetch location.', 500);
        }
    }

    // ── PUT /api/locations/{id} ───────────────────────────────────────────────
    public function update(UpdateLocationRequest $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'LocationController::update');

        try {
            $location = Location::findOrFail($id);
            $old      = $location->toArray();

            $location->update($request->validated());

            Log::info('[LocationController] Updated', array_merge($ctx, ['location_id' => $id]));

            try {
                $this->audit($request, 'updated', $id, $old, $location->fresh()->toArray());
            } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }

            return $this->successResponse([
                'message' => 'Location updated.',
                'data'    => $location->fresh(['defaultTxnSeries:id,name', 'createdBy:id,name,phone']),
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Location not found.', 404);
        } catch (Throwable $e) {
            $this->logException('LocationController::update', $e, $ctx);
            return $this->errorResponse('Failed to update location.', 500);
        }
    }

    // ── DELETE /api/locations/{id} ────────────────────────────────────────────
    public function destroy(Request $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'LocationController::destroy');

        try {
            $location = Location::findOrFail($id);

            // Collect this location + every descendant (recursive via closure table pattern)
            $allIds = $this->collectDescendantIds($id);

            DB::transaction(function () use ($request, $location, $allIds, $id) {
                // Audit + soft-delete every location in the subtree (bulk fetch to avoid N+1)
                $locations = Location::whereIn('id', $allIds)->get()->keyBy('id');
                foreach ($allIds as $locId) {
                    $loc = $locations->get($locId);
                    if (!$loc) continue;
                    try {
                        $this->audit($request, 'deleted', $locId, $loc->toArray(), null);
                    } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }
                    $loc->delete();
                }

                // Also record the removal on the parent so its History tab reflects the change
                if ($location->parent_id) {
                    try {
                        $this->audit($request, 'child_deleted', $location->parent_id,
                            ['child_id' => $location->id, 'child_name' => $location->name], null);
                    } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }
                }
            });

            Log::info('[LocationController] Deleted', array_merge($ctx, ['location_id' => $id]));
            return $this->successResponse(['message' => 'Location deleted.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Location not found.', 404);
        } catch (Throwable $e) {
            $this->logException('LocationController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete location.', 500);
        }
    }

    // ── POST /api/locations/{id}/set-primary ─────────────────────────────────
    public function setPrimary(Request $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'LocationController::setPrimary');

        try {
            $location = Location::findOrFail($id);

            DB::transaction(function () use ($location) {
                Location::where('is_primary', true)->update(['is_primary' => false]);
                $location->update(['is_primary' => true]);
            });

            try {
                $this->audit($request, 'set_primary', $id, null, ['is_primary' => true]);
            } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }

            return $this->successResponse(['message' => 'Primary location updated.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Location not found.', 404);
        } catch (Throwable $e) {
            $this->logException('LocationController::setPrimary', $e, $ctx);
            return $this->errorResponse('Failed to set primary location.', 500);
        }
    }

    // ── POST /api/locations/{id}/restore ─────────────────────────────────────
    public function restore(Request $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'LocationController::restore');

        try {
            $location = Location::onlyTrashed()->findOrFail($id);

            // Cascade-restore every descendant that was soft-deleted at or after this location
            $allIds = $this->collectDescendantIds($id, onlyTrashed: true);

            // Bulk fetch to avoid N+1 queries per restored location
            $trashedLocs = Location::onlyTrashed()->whereIn('id', $allIds)->get()->keyBy('id');
            foreach ($allIds as $locId) {
                $loc = $trashedLocs->get($locId);
                if (!$loc) continue;
                $loc->restore();
                try {
                    $this->audit($request, 'restored', $locId, null, $loc->fresh()->toArray());
                } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }
            }

            if ($location->parent_id) {
                try {
                    $this->audit($request, 'child_restored', $location->parent_id,
                        null, ['child_id' => $location->id, 'child_name' => $location->name]);
                } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }
            }

            return $this->successResponse([
                'message'      => 'Location restored.',
                'data'         => $location->fresh(),
                'restored_ids' => $allIds,
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Deleted location not found.', 404);
        } catch (Throwable $e) {
            $this->logException('LocationController::restore', $e, $ctx);
            return $this->errorResponse('Failed to restore location.', 500);
        }
    }

    // ── POST /api/locations/upload-logo ──────────────────────────────────────
    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpg,jpeg,png,svg,webp|max:2048',
        ]);

        $ctx = $this->buildCtx($request, 'LocationController::uploadLogo');

        try {
            $path = $request->file('logo')->store('locations/logos', 'public');
            return $this->successResponse(['path' => $path], 201);

        } catch (Throwable $e) {
            $this->logException('LocationController::uploadLogo', $e, $ctx);
            return $this->errorResponse('Failed to upload logo.', 500);
        }
    }

    // ── PUT /api/locations/{id}/access ───────────────────────────────────────
    public function updateAccess(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'access_users'              => 'required|array',
            'access_users.*.user_id'    => 'required|integer|exists:users,id',
            'access_users.*.role'       => 'required|string|max:50',
        ]);

        $ctx = $this->buildCtx($request, 'LocationController::updateAccess');

        try {
            $location = Location::findOrFail($id);
            $old      = $location->access_users;

            $deduped = collect($request->access_users)
                ->keyBy('user_id')
                ->values()
                ->map(fn($u) => ['user_id' => (int) $u['user_id'], 'role' => $u['role']])
                ->all();

            $location->update(['access_users' => $deduped]);

            try {
                $this->audit($request, 'access_updated', $id,
                    ['access_users' => $old],
                    ['access_users' => $deduped]
                );
            } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }

            return $this->successResponse([
                'message'      => 'Access users updated.',
                'access_users' => $location->access_users,
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Location not found.', 404);
        } catch (Throwable $e) {
            $this->logException('LocationController::updateAccess', $e, $ctx);
            return $this->errorResponse('Failed to update access users.', 500);
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function collectDescendantIds(int $rootId, bool $onlyTrashed = false): array
    {
        // Single recursive CTE — one query regardless of tree depth
        $deletedFilter = $onlyTrashed
            ? 'AND deleted_at IS NOT NULL'
            : '';                             // withTrashed: include all rows

        $rows = DB::select("
            WITH RECURSIVE descendants AS (
                SELECT id FROM locations WHERE id = ? {$deletedFilter}
                UNION ALL
                SELECT l.id
                FROM locations l
                INNER JOIN descendants d ON l.parent_id = d.id
                {$deletedFilter}
            )
            SELECT id FROM descendants
        ", [$rootId]);

        return array_column($rows, 'id');
    }

    private function audit(
        Request $request,
        string  $event,
        int     $locationId,
        ?array  $oldValues,
        ?array  $newValues
    ): void {
        AuditLog::create([
            'auditable_type' => 'location',
            'auditable_id'   => $locationId,
            'event'          => $event,
            'user_id'        => $request->user()->id,
            'ip_address'     => $request->ip(),
            'user_agent'     => $request->userAgent(),
            'old_values'     => $oldValues,
            'new_values'     => $newValues,
        ]);
    }
}
