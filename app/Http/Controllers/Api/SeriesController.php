<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignLocationsRequest;
use App\Http\Requests\StoreSeriesRequest;
use App\Http\Requests\UpdateSeriesRequest;
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
            $series = TransactionSeries::with('modulesConfig')
                ->selectRaw("transaction_series.*, (
                    SELECT COUNT(DISTINCT id)
                    FROM locations
                    WHERE (txn_series_id = transaction_series.id OR default_txn_series_id = transaction_series.id)
                      AND deleted_at IS NULL
                ) as locations_count")
                ->when($request->query('search'), fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
                ->orderBy('name')
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

            $series = TransactionSeries::create(['name' => $request->validated('name')]);

            TransactionSeriesModule::create([
                'series_id' => $series->id,
                'modules'   => $this->normaliseModules($request->validated('modules')),
            ]);

            DB::commit();

            Log::info('[SeriesController] Created', array_merge($ctx, ['series_id' => $series->id]));

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
            $series = TransactionSeries::with('modulesConfig')->findOrFail($id);
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
            $series = TransactionSeries::findOrFail($id);

            DB::beginTransaction();

            $validated = $request->validated();

            if (array_key_exists('name', $validated)) {
                $series->update(['name' => $validated['name']]);
            }

            if (array_key_exists('modules', $validated)) {
                $series->modulesConfig()->updateOrCreate(
                    ['series_id' => $series->id],
                    ['modules'   => $this->normaliseModules($validated['modules'])]
                );
            }

            DB::commit();

            Log::info('[SeriesController] Updated', array_merge($ctx, ['series_id' => $id]));

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
            $series->delete();

            Log::info('[SeriesController] Deleted', array_merge($ctx, ['series_id' => $id]));
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

            // Clear this series from all locations currently assigned to it
            Location::where('default_txn_series_id', $id)
                ->update(['default_txn_series_id' => null]);

            // Assign to the new set of locations
            $locationIds = $request->validated('location_ids', []);
            if (!empty($locationIds)) {
                Location::whereIn('id', $locationIds)
                    ->update(['default_txn_series_id' => $id]);
            }

            DB::commit();

            Log::info('[SeriesController] Locations assigned', array_merge($ctx, [
                'series_id'    => $id,
                'location_ids' => $locationIds,
            ]));
            return $this->successResponse(['message' => 'Locations assigned successfully.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Series not found.', 404);
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('SeriesController::assignLocations', $e, $ctx);
            return $this->errorResponse('Failed to assign locations.', 500);
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function normaliseModules(array $modules): array
    {
        return array_map(function (array $m) {
            return [
                'module'            => $m['module'],
                'prefix'            => $m['prefix'] ?? '',
                'starting_number'   => $m['starting_number'] ?? '1',
                'current_number'    => (int) ($m['starting_number'] ?? 1),
                'restart_numbering' => $m['restart_numbering'] ?? 'None',
                'last_reset_at'     => null,
            ];
        }, $modules);
    }
}
