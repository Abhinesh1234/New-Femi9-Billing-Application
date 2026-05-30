<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\EnforcesPartyScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class InventoryController extends Controller
{
    use EnforcesPartyScope;

    // ── GET /api/inventory/summary ────────────────────────────────────────────
    //
    // Query params:
    //   location_id  (int, optional)  — filter to a specific location
    //   as_of_date   (date, optional) — historical snapshot; defaults to current snapshot
    //   party_id     (int, optional)  — 0 or absent = company locations (party_id IS NULL)
    //                                   > 0 = customer locations (party_id = ?)
    //
    public function summary(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'InventoryController::summary');

        try {
            $locationId = $request->filled('location_id') ? (int) $request->query('location_id') : null;
            $asOfDate   = $request->filled('as_of_date')  ? $request->query('as_of_date')        : null;

            // Party users see their own hierarchy; company users can pass party_id as a single filter
            $scopedIds = $this->partyScopeIds();
            if (!empty($scopedIds)) {
                $partyIds = $scopedIds;
            } elseif ($request->filled('party_id')) {
                $raw = (int) $request->query('party_id');
                $partyIds = $raw > 0 ? [$raw] : [];
            } else {
                $partyIds = [];
            }

            // Validate as_of_date if provided
            if ($asOfDate && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $asOfDate)) {
                return $this->errorResponse('Invalid as_of_date format. Use YYYY-MM-DD.', 422);
            }

            $today = now()->toDateString();
            $useSnapshot = is_null($asOfDate) || $asOfDate >= $today;

            if ($useSnapshot) {
                $data = $this->fromSnapshot($locationId, $partyIds);
            } else {
                $data = $this->fromLedger($locationId, $partyIds, $asOfDate);
            }

            return response()->json(['success' => true, 'data' => $data])
                ->header('Cache-Control', 'private, no-cache');

        } catch (Throwable $e) {
            $this->logException('InventoryController::summary', $e, $ctx);
            return $this->errorResponse('Failed to fetch inventory summary.', 500);
        }
    }

    // ── Current snapshot from item_stock ──────────────────────────────────────
    private function fromSnapshot(?int $locationId, array $partyIds): array
    {
        $rows = DB::table('item_stock as s')
            ->join('items as i',     'i.id', '=', 's.item_id')
            ->join('locations as l', 'l.id', '=', 's.location_id')
            ->select([
                's.item_id',
                'i.name  as item_name',
                'i.sku',
                'i.unit',
                'i.image',
                DB::raw('SUM(s.stock_on_hand)      as stock_on_hand'),
                DB::raw('SUM(s.committed_stock)    as committed'),
                DB::raw('SUM(s.available_for_sale) as available_for_sale'),
            ])
            ->whereNull('i.deleted_at')
            ->when($locationId, fn($q) => $q->where('s.location_id', $locationId))
            ->when(
                !empty($partyIds),
                fn($q) => $q->whereIn('l.party_id', $partyIds),
                fn($q) => $q->whereNull('l.party_id')
            )
            ->groupBy('s.item_id', 'i.name', 'i.sku', 'i.unit', 'i.image')
            ->orderBy('i.name')
            ->get();

        return $this->formatRows($rows);
    }

    // ── Historical snapshot from item_stock_ledger ────────────────────────────
    // Picks the latest ledger entry per (item_id, location_id) where
    // transaction_date <= as_of_date, then sums across locations.
    private function fromLedger(?int $locationId, array $partyIds, string $asOfDate): array
    {
        $locationFilter = $locationId
            ? "AND isl.location_id = " . (int) $locationId
            : '';

        if (!empty($partyIds)) {
            $inList      = implode(',', array_map('intval', $partyIds));
            $partyFilter = "AND l.party_id IN ({$inList})";
        } else {
            $partyFilter = "AND l.party_id IS NULL";
        }

        $rows = DB::select("
            WITH latest AS (
                SELECT
                    isl.item_id,
                    isl.location_id,
                    isl.stock_on_hand_after   AS stock_on_hand,
                    isl.committed_after       AS committed,
                    isl.available_after       AS available_for_sale,
                    ROW_NUMBER() OVER (
                        PARTITION BY isl.item_id, isl.location_id
                        ORDER BY isl.transaction_date DESC, isl.id DESC
                    ) AS rn
                FROM item_stock_ledger isl
                INNER JOIN locations l ON l.id = isl.location_id
                WHERE isl.transaction_date <= ?
                  AND l.deleted_at IS NULL
                  {$locationFilter}
                  {$partyFilter}
            )
            SELECT
                i.id         AS item_id,
                i.name       AS item_name,
                i.sku,
                i.unit,
                i.image,
                SUM(lt.stock_on_hand)      AS stock_on_hand,
                SUM(lt.committed)          AS committed,
                SUM(lt.available_for_sale) AS available_for_sale
            FROM latest lt
            INNER JOIN items i ON i.id = lt.item_id
            WHERE lt.rn = 1
              AND i.deleted_at IS NULL
            GROUP BY i.id, i.name, i.sku, i.unit, i.image
            ORDER BY i.name
        ", [$asOfDate]);

        return $this->formatRows($rows);
    }

    private function formatRows(iterable $rows): array
    {
        return collect($rows)->map(fn($r) => [
            'item_id'            => (int) $r->item_id,
            'item_name'          => $r->item_name,
            'sku'                => $r->sku,
            'unit'               => $r->unit,
            'image'              => $r->image,
            'stock_on_hand'      => (float) $r->stock_on_hand,
            'committed'          => (float) $r->committed,
            'available_for_sale' => (float) $r->available_for_sale,
        ])->values()->all();
    }
}
