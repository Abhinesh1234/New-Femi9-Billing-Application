<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\EnforcesPartyScope;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ItemSalesChartController extends Controller
{
    use EnforcesPartyScope;

    public function __invoke(Request $request, int $itemId): JsonResponse
    {
        $period = in_array($request->query('period'), ['week', 'month', 'quarter', 'year'], true)
            ? $request->query('period')
            : 'month';

        [$start, $end, $labels, $groupMode] = $this->periodBuckets($period);

        $rows = $this->fetchRows($itemId, $start, $end, $groupMode);

        $amounts = array_map(fn ($key) => (float) ($rows[$key]->total ?? 0), array_keys($labels));
        $total   = round(array_sum($amounts), 2);

        return response()->json([
            'success' => true,
            'labels'  => array_values($labels),
            'amounts' => $amounts,
            'total'   => $total,
        ]);
    }

    // ── Query ─────────────────────────────────────────────────────────────────

    private function fetchRows(int $itemId, Carbon $start, Carbon $end, string $groupMode): \Illuminate\Support\Collection
    {
        $q = DB::table('invoice_items as ii')
            ->join('invoices as i',       'ii.invoice_id',   '=', 'i.id')
            ->join('locations as loc',    'i.location_id',   '=', 'loc.id')
            ->whereNull('i.deleted_at')
            ->where('ii.item_id', $itemId)
            ->whereRaw('i.balance_amount <= 0')  // fully paid invoices only
            ->whereBetween('i.invoice_date', [$start->toDateString(), $end->toDateString()]);

        // Scope to the correct set of locations:
        // - Party users  → invoices issued from their own locations
        // - Company users → invoices from company-owned locations only (exclude party locations)
        $partyScopeId = $this->partyScopeId();
        if ($partyScopeId !== null) {
            $q->where('loc.party_id', $partyScopeId);
        } else {
            $q->whereNull('loc.party_id');
        }

        $bucketExpr = match ($groupMode) {
            'weekly'  => "DATE(DATE_SUB(i.invoice_date, INTERVAL WEEKDAY(i.invoice_date) DAY)) as bucket",
            'monthly' => "DATE_FORMAT(i.invoice_date, '%Y-%m-01') as bucket",
            default   => "DATE(i.invoice_date) as bucket",
        };

        return $q->selectRaw("{$bucketExpr}, SUM(ii.amount) as total")
                 ->groupBy('bucket')
                 ->orderBy('bucket')
                 ->get()
                 ->keyBy('bucket');
    }

    // ── Period helpers ────────────────────────────────────────────────────────

    /** Returns [Carbon $start, Carbon $end, array<string,string> $labels, string $groupMode] */
    private function periodBuckets(string $period): array
    {
        $today = Carbon::today();

        return match ($period) {
            'week' => (function () use ($today): array {
                $start  = $today->copy()->startOfWeek(Carbon::MONDAY);
                $end    = $today->copy()->endOfWeek(Carbon::SUNDAY);
                $labels = [];
                for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
                    $labels[$d->toDateString()] = $d->format('D'); // Mon, Tue …
                }
                return [$start, $end, $labels, 'daily'];
            })(),

            'quarter' => (function () use ($today): array {
                $start  = $today->copy()->firstOfQuarter();
                $end    = $today->copy()->lastOfQuarter();
                // Align cursor to the Monday of the week that contains $start
                $cursor = $start->copy()->startOfWeek(Carbon::MONDAY);
                $labels = [];
                $wk     = 1;
                while ($cursor->lte($end)) {
                    $labels[$cursor->toDateString()] = "Wk {$wk}";
                    $cursor->addWeek();
                    $wk++;
                }
                return [$start, $end, $labels, 'weekly'];
            })(),

            'year' => (function () use ($today): array {
                $start  = $today->copy()->startOfYear();
                $end    = $today->copy()->endOfYear();
                $labels = [];
                for ($m = 1; $m <= 12; $m++) {
                    $key = Carbon::create($today->year, $m, 1)->format('Y-m-d');
                    $labels[$key] = Carbon::create($today->year, $m, 1)->format('M');
                }
                return [$start, $end, $labels, 'monthly'];
            })(),

            default => (function () use ($today): array { // month
                $start  = $today->copy()->startOfMonth();
                $end    = $today->copy()->endOfMonth();
                $labels = [];
                for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
                    $labels[$d->toDateString()] = (string) $d->day; // 1, 2 … 31
                }
                return [$start, $end, $labels, 'daily'];
            })(),
        };
    }
}
