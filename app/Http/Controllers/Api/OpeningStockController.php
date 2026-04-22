<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveOpeningStockRequest;
use App\Models\AuditLog;
use App\Models\Item;
use App\Models\ItemStock;
use App\Models\ItemStockLedger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class OpeningStockController extends Controller
{
    // ── GET /api/items/{item}/opening-stock ───────────────────────────────────
    public function show(Request $request, int $itemId): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'OpeningStockController::show', ['item_id' => $itemId]);

        try {
            if (!Item::withTrashed()->where('id', $itemId)->exists()) {
                return $this->errorResponse('Item not found.', 404);
            }

            $entries = ItemStockLedger::where('item_id', $itemId)
                ->where('transaction_type', 'opening')
                ->with('location:id,name')
                ->get(['location_id', 'qty_change', 'unit_value'])
                ->map(fn($row) => [
                    'location_id'         => $row->location_id,
                    'location_name'       => $row->location?->name ?? '',
                    'opening_stock'       => (float) $row->qty_change,
                    'opening_stock_value' => (float) ($row->unit_value ?? 0),
                ]);

            return $this->successResponse(['data' => $entries]);

        } catch (Throwable $e) {
            $this->logException('OpeningStockController::show', $e, $ctx);
            return $this->errorResponse('Failed to fetch opening stock.', 500);
        }
    }

    // ── POST /api/items/{item}/opening-stock ──────────────────────────────────
    public function save(SaveOpeningStockRequest $request, int $itemId): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'OpeningStockController::save', ['item_id' => $itemId]);
        Log::info('[OpeningStockController] Save started', $ctx);

        try {
            if (!Item::withTrashed()->where('id', $itemId)->exists()) {
                return $this->errorResponse('Item not found.', 404);
            }

            $entries  = $request->validated()['entries'];
            $today    = now()->toDateString();
            $userId   = $request->user()->id;
            $locIds   = array_column($entries, 'location_id');

            // Reject if any submitted location already has an opening entry
            $existing = ItemStockLedger::where('item_id', $itemId)
                ->where('transaction_type', 'opening')
                ->whereIn('location_id', $locIds)
                ->pluck('location_id')
                ->toArray();

            if (!empty($existing)) {
                return $this->errorResponse(
                    'Opening stock has already been set for one or more of the selected locations and cannot be changed.',
                    422
                );
            }

            DB::transaction(function () use ($itemId, $entries, $today, $userId) {
                foreach ($entries as $entry) {
                    $locId = (int) $entry['location_id'];
                    $qty   = (float) $entry['opening_stock'];
                    $value = (float) $entry['opening_stock_value'];

                    ItemStockLedger::create([
                        'item_id'             => $itemId,
                        'location_id'         => $locId,
                        'transaction_type'    => 'opening',
                        'transaction_date'    => $today,
                        'qty_change'          => $qty,
                        'committed_change'    => 0,
                        'unit_value'          => $value > 0 ? $value : null,
                        'stock_on_hand_after' => $qty,
                        'committed_after'     => 0,
                        'available_after'     => $qty,
                        'created_by'          => $userId,
                    ]);

                    ItemStock::updateOrCreate(
                        ['item_id' => $itemId, 'location_id' => $locId],
                        [
                            'stock_on_hand'      => $qty,
                            'committed_stock'    => 0,
                            'available_for_sale' => $qty,
                        ]
                    );
                }
            });

            Log::info('[OpeningStockController] Save success', array_merge($ctx, [
                'entry_count' => count($entries),
            ]));

            try {
                $this->audit($request, $itemId, $entries);
            } catch (Throwable) {}

            return $this->successResponse([
                'message' => 'Opening stock saved successfully.',
            ], 201);

        } catch (Throwable $e) {
            $this->logException('OpeningStockController::save', $e, $ctx);
            return $this->errorResponse('Failed to save opening stock.', 500);
        }
    }

    // ── GET /api/items/{item}/stock ───────────────────────────────────────────
    public function stock(Request $request, int $itemId): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'OpeningStockController::stock', ['item_id' => $itemId]);

        try {
            if (!Item::withTrashed()->where('id', $itemId)->exists()) {
                return $this->errorResponse('Item not found.', 404);
            }

            $rows = ItemStock::where('item_id', $itemId)
                ->get(['location_id', 'stock_on_hand', 'committed_stock', 'available_for_sale']);

            return $this->successResponse(['data' => $rows]);

        } catch (Throwable $e) {
            $this->logException('OpeningStockController::stock', $e, $ctx);
            return $this->errorResponse('Failed to fetch stock.', 500);
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function audit(Request $request, int $itemId, array $entries): void
    {
        $locationIds   = array_column($entries, 'location_id');
        $locationNames = \App\Models\Location::whereIn('id', $locationIds)
            ->pluck('name', 'id')
            ->toArray();

        $enriched = array_map(fn($e) => [
            'location_id'         => $e['location_id'],
            'location_name'       => $locationNames[$e['location_id']] ?? "Location #{$e['location_id']}",
            'opening_stock'       => $e['opening_stock'],
            'opening_stock_value' => $e['opening_stock_value'],
        ], $entries);

        AuditLog::create([
            'auditable_type' => 'items',
            'auditable_id'   => $itemId,
            'event'          => 'opening_stock_saved',
            'user_id'        => $request->user()->id,
            'ip_address'     => $request->ip(),
            'user_agent'     => $request->userAgent(),
            'old_values'     => null,
            'new_values'     => ['entries' => $enriched],
        ]);
    }
}
