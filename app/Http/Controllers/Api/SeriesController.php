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

            $perPage = max(1, min((int) $request->query('per_page', 100), 200));

            $paginated = TransactionSeries::with('modulesConfig')
                ->leftJoinSub($locationCountSub, 'lc', 'lc.series_id', '=', 'transaction_series.id')
                ->select(['transaction_series.*', DB::raw('COALESCE(lc.cnt, 0) AS locations_count')])
                ->when($request->boolean('trashed'), fn($q) => $q->onlyTrashed())
                ->when($request->query('search'), fn($q, $s) => $q->where('transaction_series.name', 'like', "%{$s}%"))
                ->orderBy('transaction_series.name')
                ->paginate($perPage);

            return $this->successResponse([
                'data' => $paginated->items(),
                'meta' => [
                    'current_page' => $paginated->currentPage(),
                    'last_page'    => $paginated->lastPage(),
                    'per_page'     => $paginated->perPage(),
                    'total'        => $paginated->total(),
                ],
            ]);

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
            } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }

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
            } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }

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
            } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }
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
            } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }
            return $this->successResponse(['message' => 'Locations assigned successfully.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Series not found.', 404);
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('SeriesController::assignLocations', $e, $ctx);
            return $this->errorResponse('Failed to assign locations.', 500);
        }
    }

    // ── GET /api/series/for-location/{locationId} ─────────────────────────────
    public function forLocation(Request $request, int $locationId): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'SeriesController::forLocation', ['location_id' => $locationId]);

        try {
            $location = Location::select('id', 'txn_series_id', 'default_txn_series_id')
                ->find($locationId);

            $ids = $location
                ? array_values(array_filter([
                    $location->txn_series_id,
                    $location->default_txn_series_id,
                  ]))
                : [];

            $series = TransactionSeries::with('modulesConfig')
                ->select('id', 'name', 'customer_category', 'is_system_default')
                ->where(function ($q) use ($ids) {
                    $q->where('is_system_default', true);
                    if (!empty($ids)) {
                        $q->orWhereIn('id', $ids);
                    }
                })
                ->whereNull('deleted_at')
                ->orderByRaw('is_system_default ASC')
                ->orderBy('name')
                ->get();

            return $this->successResponse(['data' => $series]);

        } catch (Throwable $e) {
            $this->logException('SeriesController::forLocation', $e, $ctx);
            return $this->errorResponse('Failed to fetch series for location.', 500);
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
            } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }
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

    // ── GET /api/series/{id}/next-number?module=Invoice ──────────────────────
    /**
     * Return the next safe invoice number for this series.
     * Uses max(current_number, highest_existing_invoice_suffix + 1)
     * so existing invoices created before the increment logic are never re-used.
     */
    public function nextNumber(Request $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'SeriesController::nextNumber');
        try {
            $series = TransactionSeries::with('modulesConfig')->findOrFail($id);
            $moduleName = trim((string) $request->query('module', 'Invoice'));

            $module = $series->modulesConfig?->getModule($moduleName);
            if (!$module) {
                return $this->errorResponse("Module \"{$moduleName}\" not found in this series.", 404);
            }

            $prefix  = (string) ($module['prefix']          ?? '');
            $padLen  = strlen((string) ($module['starting_number'] ?? '1'));
            $current = (int)   ($module['current_number']   ?? 1);

            // Scan existing invoices with this prefix to find the highest used number,
            // so we never suggest a number that was already issued (even before the
            // increment logic existed).
            if ($prefix !== '') {
                $maxExisting = \App\Models\Invoice::withTrashed()
                    ->where('invoice_number', 'like', $prefix . '%')
                    ->selectRaw('MAX(CAST(SUBSTRING(invoice_number, ?) AS UNSIGNED)) AS max_num', [strlen($prefix) + 1])
                    ->value('max_num');

                if ($maxExisting !== null && (int) $maxExisting >= $current) {
                    $current = (int) $maxExisting + 1;
                }
            }

            return $this->successResponse([
                'data' => [
                    'invoice_number' => $prefix . str_pad($current, $padLen, '0', STR_PAD_LEFT),
                    'prefix'         => $prefix,
                    'current_number' => $current,
                    'pad_length'     => $padLen,
                ],
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Series not found.', 404);
        } catch (Throwable $e) {
            $this->logException('SeriesController::nextNumber', $e, $ctx);
            return $this->errorResponse('Failed to fetch next number.', 500);
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
