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
    // Party users only see opening stock for locations that belong to their party.
    public function show(Request $request, int $itemId): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'OpeningStockController::show', ['item_id' => $itemId]);
        Log::info('[OpeningStockController] Show started', $ctx);

        try {
            if (!Item::withTrashed()->where('id', $itemId)->exists()) {
                Log::warning('[OpeningStockController] Show — item not found', $ctx);
                return $this->errorResponse('Item not found.', 404);
            }

            $partyScopeId = $request->attributes->get('party_scope_id');

            $query = ItemStockLedger::where('item_stock_ledger.item_id', $itemId)
                ->where('item_stock_ledger.transaction_type', 'opening')
                ->join('locations', 'item_stock_ledger.location_id', '=', 'locations.id');

            if ($partyScopeId !== null) {
                $query->where('locations.party_id', $partyScopeId);
            } else {
                $query->whereNull('locations.party_id');
            }

            $entries = $query
                ->with('location:id,name')
                ->orderBy('item_stock_ledger.id')
                ->get(['item_stock_ledger.id', 'item_stock_ledger.location_id', 'item_stock_ledger.qty_change', 'item_stock_ledger.unit_value'])
                ->map(fn($row) => [
                    'location_id'         => $row->location_id,
                    'location_name'       => $row->location?->name ?? '',
                    'opening_stock'       => (float) $row->qty_change,
                    'opening_stock_value' => (float) ($row->unit_value ?? 0),
                ]);

            Log::info('[OpeningStockController] Show success', array_merge($ctx, ['count' => $entries->count()]));

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
            // Only allow active (non-deleted) items to receive opening stock
            $item = Item::find($itemId);
            if (!$item) {
                return $this->errorResponse('Item not found.', 404);
            }

            $entries  = $request->validated()['entries'];
            $today    = now()->toDateString();
            $userId   = $request->user()->id;
            $locIds   = array_column($entries, 'location_id');

            DB::transaction(function () use ($itemId, $entries, $today, $userId, $locIds) {
                // Re-check inside the transaction with a row lock to prevent
                // duplicate opening entries from concurrent requests
                $existing = ItemStockLedger::where('item_id', $itemId)
                    ->where('transaction_type', 'opening')
                    ->whereIn('location_id', $locIds)
                    ->lockForUpdate()
                    ->pluck('location_id')
                    ->toArray();

                if (!empty($existing)) {
                    throw new \RuntimeException(
                        'Opening stock has already been set for one or more of the selected locations and cannot be changed.'
                    );
                }
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
                        'unit_value'          => $value >= 0 ? $value : null,
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
            } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }

            return $this->successResponse([
                'message' => 'Opening stock saved successfully.',
            ], 201);

        } catch (\RuntimeException $e) {
            // Business-rule violations surfaced from inside the transaction
            return $this->errorResponse($e->getMessage(), 422);
        } catch (Throwable $e) {
            $this->logException('OpeningStockController::save', $e, $ctx);
            return $this->errorResponse('Failed to save opening stock.', 500);
        }
    }

    // ── GET /api/items/{item}/stock ───────────────────────────────────────────
    // Party users only see stock for locations that belong to their party.
    public function stock(Request $request, int $itemId): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'OpeningStockController::stock', ['item_id' => $itemId]);
        Log::info('[OpeningStockController] Stock started', $ctx);

        try {
            if (!Item::withTrashed()->where('id', $itemId)->exists()) {
                Log::warning('[OpeningStockController] Stock — item not found', $ctx);
                return $this->errorResponse('Item not found.', 404);
            }

            $partyScopeId = $request->attributes->get('party_scope_id');

            if ($partyScopeId !== null) {
                // Party portal: start from locations so all active party locations appear even with zero stock.
                // LEFT JOIN item_stock so locations with no stock row still show as 0.
                $rows = DB::table('locations as l')
                    ->leftJoin('item_stock as s', function ($join) use ($itemId) {
                        $join->on('s.location_id', '=', 'l.id')
                             ->where('s.item_id', '=', $itemId);
                    })
                    ->where('l.party_id', $partyScopeId)
                    ->where('l.is_active', true)
                    ->whereNull('l.deleted_at')
                    ->select(
                        'l.id as location_id',
                        'l.name as location_name',
                        DB::raw('COALESCE(s.stock_on_hand, 0) as stock_on_hand'),
                        DB::raw('COALESCE(s.committed_stock, 0) as committed_stock'),
                        DB::raw('COALESCE(s.available_for_sale, 0) as available_for_sale')
                    )
                    ->orderBy('l.name')
                    ->get();
            } else {
                // Admin: company-owned locations only (party_id IS NULL).
                $rows = ItemStock::where('item_stock.item_id', $itemId)
                    ->join('locations', 'item_stock.location_id', '=', 'locations.id')
                    ->whereNull('locations.party_id')
                    ->select(
                        'item_stock.location_id',
                        'locations.name as location_name',
                        'item_stock.stock_on_hand',
                        'item_stock.committed_stock',
                        'item_stock.available_for_sale'
                    )
                    ->orderBy('item_stock.location_id')
                    ->get();
            }

            Log::info('[OpeningStockController] Stock success', array_merge($ctx, ['count' => $rows->count()]));

            return $this->successResponse(['data' => $rows]);

        } catch (Throwable $e) {
            $this->logException('OpeningStockController::stock', $e, $ctx);
            return $this->errorResponse('Failed to fetch stock.', 500);
        }
    }

    // ── POST /api/items/stock-batch ───────────────────────────────────────────
    // Body: { item_ids: [1,2,3], location_id: 5 }
    // Returns: { data: { "1": "10.00", "2": "0.00" } }  — missing ids are absent
    // Party users may only query a location that belongs to their own party.
    public function stockBatch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'item_ids'    => ['required', 'array', 'max:200'],
            'item_ids.*'  => ['integer', 'min:1'],
            'location_id' => ['required', 'integer', 'min:1'],
        ]);

        try {
            $partyScopeId = $request->attributes->get('party_scope_id');

            // Verify the requested location belongs to the authenticated party.
            if ($partyScopeId !== null) {
                $locationBelongsToParty = \App\Models\Location::where('id', $validated['location_id'])
                    ->where('party_id', $partyScopeId)
                    ->exists();

                if (!$locationBelongsToParty) {
                    return $this->errorResponse('Location not found.', 404);
                }
            }

            $rows = ItemStock::whereIn('item_id', $validated['item_ids'])
                ->where('location_id', $validated['location_id'])
                ->get(['item_id', 'available_for_sale']);

            $map = [];
            foreach ($rows as $row) {
                $map[(string) $row->item_id] = (string) $row->available_for_sale;
            }

            return $this->successResponse(['data' => $map]);
        } catch (Throwable $e) {
            $this->logException('OpeningStockController::stockBatch', $e, []);
            return $this->errorResponse('Failed to fetch stock.', 500);
        }
    }

    // ── POST /api/items/stock-totals ─────────────────────────────────────────
    // Body: { item_ids: [1,2,3] }
    // Returns: { data: { "1": "10.00", "2": "5.00" } } — stock_on_hand summed across locations
    // Party users only see stock for locations that belong to their own party.
    public function stockTotals(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'item_ids'   => ['required', 'array', 'max:500'],
            'item_ids.*' => ['integer', 'min:1'],
        ]);

        try {
            $partyScopeId = $request->attributes->get('party_scope_id');

            if ($partyScopeId !== null) {
                // Party portal: sum only across locations that belong to the authenticated party.
                $rows = ItemStock::whereIn('item_stock.item_id', $validated['item_ids'])
                    ->join('locations', 'item_stock.location_id', '=', 'locations.id')
                    ->where('locations.party_id', $partyScopeId)
                    ->selectRaw('item_stock.item_id, SUM(item_stock.stock_on_hand) as total_stock')
                    ->groupBy('item_stock.item_id')
                    ->get();
            } else {
                // Admin portal: company-wide totals across company-owned locations only
                // (exclude party-owned locations, which have a non-null party_id).
                $rows = ItemStock::whereIn('item_stock.item_id', $validated['item_ids'])
                    ->join('locations', 'item_stock.location_id', '=', 'locations.id')
                    ->whereNull('locations.party_id')
                    ->selectRaw('item_stock.item_id, SUM(item_stock.stock_on_hand) as total_stock')
                    ->groupBy('item_stock.item_id')
                    ->get();
            }

            $map = [];
            foreach ($rows as $row) {
                $map[(string) $row->item_id] = number_format((float) $row->total_stock, 2, '.', '');
            }

            return $this->successResponse(['data' => $map]);
        } catch (Throwable $e) {
            $this->logException('OpeningStockController::stockTotals', $e, []);
            return $this->errorResponse('Failed to fetch stock totals.', 500);
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

        // party_user_id is set on the request by ScopeToParty middleware — more
        // reliable than instanceof checks, which can misfire when an admin session
        // cookie overrides a party Bearer token on the same domain.
        $partyUserId = $request->attributes->get('party_user_id');

        AuditLog::create([
            'auditable_type' => 'items',
            'auditable_id'   => $itemId,
            'event'          => 'opening_stock_saved',
            'user_id'        => $partyUserId ? null : $request->user()?->id,
            'party_user_id'  => $partyUserId ?: null,
            'ip_address'     => $request->ip(),
            'user_agent'     => $request->userAgent(),
            'old_values'     => null,
            'new_values'     => ['entries' => $enriched],
        ]);
    }
}
