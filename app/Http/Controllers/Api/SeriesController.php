<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignLocationsRequest;
use App\Http\Requests\StoreSeriesRequest;
use App\Http\Requests\UpdateSeriesRequest;
use App\Models\AuditLog;
use App\Models\Location;
use App\Models\TransactionSeries;
use App\Models\TransactionSeriesModule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class SeriesController extends Controller
{
    // ── GET /api/series ───────────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'SeriesController::index');

        try {
            // Single-pass LEFT JOIN replaces the previous per-row correlated subquery
            $locationCountSub = DB::table(DB::raw("(
                SELECT id, txn_series_id         AS series_id FROM locations WHERE txn_series_id         IS NOT NULL AND deleted_at IS NULL
                UNION
                SELECT id, default_txn_series_id AS series_id FROM locations WHERE default_txn_series_id IS NOT NULL AND deleted_at IS NULL
            ) AS loc_union"))
                ->selectRaw('series_id, COUNT(id) AS cnt')
                ->groupBy('series_id');

            $series = TransactionSeries::with('modulesConfig')
                ->leftJoinSub($locationCountSub, 'lc', 'lc.series_id', '=', 'transaction_series.id')
                ->select(['transaction_series.*', DB::raw('COALESCE(lc.cnt, 0) AS locations_count')])
                ->when($request->boolean('trashed'), fn($q) => $q->onlyTrashed())
                ->when($request->query('search'), fn($q, $s) => $q->where('transaction_series.name', 'like', "%{$s}%"))
                ->orderBy('transaction_series.name')
                ->get();

            return $this->successResponse(['data' => $series]);

        } catch (Throwable $e) {
            $this->logException('SeriesController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch series.', 500);
        }
    }

    // ── POST /api/series ──────────────────────────────────────────────────────
    public function store(StoreSeriesRequest $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'SeriesController::store');

        try {
            DB::beginTransaction();

            $createData = ['name' => $request->validated('name')];
            if ($request->has('customer_category')) {
                $createData['customer_category'] = $request->validated('customer_category');
            }

            $series = TransactionSeries::create($createData);

            $normalised = $this->normaliseModules($request->validated('modules'));
            TransactionSeriesModule::create([
                'series_id' => $series->id,
                'modules'   => $normalised,
            ]);

            DB::commit();

            Log::info('[SeriesController] Created', array_merge($ctx, ['series_id' => $series->id]));
            try {
                $this->audit($request, 'created', $series->id, null, [
                    'name'            => $series->name,
                    'customer_category' => $series->customer_category,
                    'modules_config'  => ['modules' => $normalised],
                ]);
            } catch (Throwable) {}

            return $this->successResponse([
                'message' => 'Transaction series created.',
                'data'    => $series->load('modulesConfig'),
            ], 201);

        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('SeriesController::store', $e, $ctx);
            return $this->errorResponse('Failed to create series.', 500);
        }
    }

    // ── GET /api/series/{id} ──────────────────────────────────────────────────
    public function show(Request $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'SeriesController::show');

        try {
            $series = TransactionSeries::withTrashed()
                ->with(['modulesConfig'])
                ->findOrFail($id);

            $locations = Location::where(function ($q) use ($id) {
                    $q->where('txn_series_id', $id)
                      ->orWhere('default_txn_series_id', $id);
                })
                ->whereNull('deleted_at')
                ->select('id', 'name')
                ->orderBy('name')
                ->get();

            $series->setRelation('locations', $locations);

            return $this->successResponse(['data' => $series]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Series not found.', 404);
        } catch (Throwable $e) {
            $this->logException('SeriesController::show', $e, $ctx);
            return $this->errorResponse('Failed to fetch series.', 500);
        }
    }

    // ── PUT /api/series/{id} ──────────────────────────────────────────────────
    public function update(UpdateSeriesRequest $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'SeriesController::update');

        try {
            $series = TransactionSeries::with('modulesConfig')->findOrFail($id);
            $oldName             = $series->name;
            $oldCategory         = $series->customer_category;
            $oldModulesConfig    = $series->modulesConfig
                ? ['modules' => $series->modulesConfig->modules ?? []]
                : null;

            DB::beginTransaction();

            $validated = $request->validated();

            if (array_key_exists('name', $validated)) {
                $series->update(['name' => $validated['name']]);
            }

            if (array_key_exists('customer_category', $validated)) {
                $series->update(['customer_category' => $validated['customer_category']]);
            }

            if (array_key_exists('modules', $validated)) {
                // Preserve current_number from existing config so live transaction counters are not reset
                $existingModules = $series->modulesConfig?->modules ?? [];
                $series->modulesConfig()->updateOrCreate(
                    ['series_id' => $series->id],
                    ['modules'   => $this->normaliseModules($validated['modules'], $existingModules)]
                );
            }

            DB::commit();

            $fresh            = $series->fresh('modulesConfig');
            $newModulesConfig = $fresh->modulesConfig
                ? ['modules' => $fresh->modulesConfig->modules ?? []]
                : null;

            $oldValues = ['name' => $oldName, 'customer_category' => $oldCategory];
            $newValues = ['name' => $fresh->name, 'customer_category' => $fresh->customer_category];

            if ($oldModulesConfig !== null || $newModulesConfig !== null) {
                $oldValues['modules_config'] = $oldModulesConfig;
                $newValues['modules_config'] = $newModulesConfig;
            }

            Log::info('[SeriesController] Updated', array_merge($ctx, ['series_id' => $id]));
            try {
                $this->audit($request, 'updated', $id, $oldValues, $newValues);
            } catch (Throwable) {}

            return $this->successResponse([
                'message' => 'Transaction series updated.',
                'data'    => $series->fresh('modulesConfig'),
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Series not found.', 404);
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('SeriesController::update', $e, $ctx);
            return $this->errorResponse('Failed to update series.', 500);
        }
    }

    // ── DELETE /api/series/{id} ───────────────────────────────────────────────
    public function destroy(Request $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'SeriesController::destroy');

        try {
            $series = TransactionSeries::findOrFail($id);
            $oldName = $series->name;
            $series->delete();

            Log::info('[SeriesController] Deleted', array_merge($ctx, ['series_id' => $id]));
            try {
                $this->audit($request, 'deleted', $id, ['name' => $oldName], null);
            } catch (Throwable) {}
            return $this->successResponse(['message' => 'Transaction series deleted.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Series not found.', 404);
        } catch (Throwable $e) {
            $this->logException('SeriesController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete series.', 500);
        }
    }

    // ── PATCH /api/series/{id}/locations ─────────────────────────────────────
    public function assignLocations(AssignLocationsRequest $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'SeriesController::assignLocations');

        try {
            TransactionSeries::findOrFail($id);

            DB::beginTransaction();

            // Clear this series from every location that references it (both FK columns)
            Location::where('default_txn_series_id', $id)->update(['default_txn_series_id' => null]);
            Location::where('txn_series_id', $id)->update(['txn_series_id' => null]);

            // Assign the new set via default_txn_series_id
            $locationIds = $request->validated('location_ids', []);
            if (!empty($locationIds)) {
                Location::whereIn('id', $locationIds)->update(['default_txn_series_id' => $id]);
            }

            DB::commit();

            Log::info('[SeriesController] Locations assigned', array_merge($ctx, [
                'series_id'    => $id,
                'location_ids' => $locationIds,
            ]));
            try {
                $this->audit($request, 'locations_assigned', $id, null, ['location_ids' => $locationIds]);
            } catch (Throwable) {}
            return $this->successResponse(['message' => 'Locations assigned successfully.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Series not found.', 404);
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('SeriesController::assignLocations', $e, $ctx);
            return $this->errorResponse('Failed to assign locations.', 500);
        }
    }

    // ── PATCH /api/series/{id}/restore ───────────────────────────────────────
    public function restore(Request $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'SeriesController::restore');

        try {
            $series = TransactionSeries::withTrashed()->findOrFail($id);

            if (!$series->trashed()) {
                return $this->errorResponse('Series is not deleted.', 422);
            }

            $series->restore();

            Log::info('[SeriesController] Restored', array_merge($ctx, ['series_id' => $id]));
            try {
                $this->audit($request, 'restored', $id, null, ['name' => $series->name]);
            } catch (Throwable) {}
            return $this->successResponse([
                'message' => 'Transaction series restored.',
                'data'    => $series->fresh('modulesConfig'),
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Series not found.', 404);
        } catch (Throwable $e) {
            $this->logException('SeriesController::restore', $e, $ctx);
            return $this->errorResponse('Failed to restore series.', 500);
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function audit(
        Request $request,
        string  $event,
        int     $seriesId,
        ?array  $oldValues,
        ?array  $newValues
    ): void {
        AuditLog::create([
            'auditable_type' => 'transaction_series',
            'auditable_id'   => $seriesId,
            'event'          => $event,
            'user_id'        => $request->user()->id,
            'ip_address'     => $request->ip(),
            'user_agent'     => $request->userAgent(),
            'old_values'     => $oldValues,
            'new_values'     => $newValues,
        ]);
    }

    /**
     * @param array      $modules         Incoming module definitions from the request.
     * @param array|null $existingModules Existing module rows from the DB; when provided,
     *                                   current_number and last_reset_at are preserved so
     *                                   live transaction counters are never reset on edit.
     */
    private function normaliseModules(array $modules, ?array $existingModules = null): array
    {
        $existingByKey = collect($existingModules ?? [])->keyBy('module');

        return array_map(function (array $m) use ($existingByKey) {
            $existing       = $existingByKey->get($m['module']);
            $startingNumber = (int) ($m['starting_number'] ?? 1);

            // Keep the live counter unless it has never been set or the new starting
            // number is higher than the current position (manual forward-bump).
            $currentNumber = $existing
                ? max($startingNumber, (int) ($existing['current_number'] ?? $startingNumber))
                : $startingNumber;

            return [
                'module'            => $m['module'],
                'prefix'            => $m['prefix'] ?? '',
                'starting_number'   => $m['starting_number'] ?? '1',
                'current_number'    => $currentNumber,
                'restart_numbering' => $m['restart_numbering'] ?? 'None',
                'last_reset_at'     => $existing ? ($existing['last_reset_at'] ?? null) : null,
            ];
        }, $modules);
    }
}
