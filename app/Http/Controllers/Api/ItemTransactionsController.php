<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\EnforcesPartyScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class ItemTransactionsController extends Controller
{
    use EnforcesPartyScope;

    public function __invoke(Request $request, int $itemId): JsonResponse
    {
        $status  = $request->query('status', 'all');
        $perPage = min((int) $request->query('per_page', 50), 200);
        $page    = max(1, (int) $request->query('page', 1));

        $validStatuses = ['draft', 'sent', 'paid', 'partially_paid', 'overdue', 'void'];

        try {
            $query = DB::table('invoice_items as ii')
                ->join('invoices as i', 'ii.invoice_id', '=', 'i.id')
                ->join('parties as p', 'i.customer_id', '=', 'p.id')
                ->whereNull('i.deleted_at')
                ->where('ii.item_id', $itemId)
                ->when(
                    $status !== 'all' && in_array($status, $validStatuses, true),
                    fn ($q) => $q->where('i.status', $status)
                );

            // Scope invoices to the relevant location set.
            if ($this->isPartyUser()) {
                // Party portal: invoices issued from this party's own locations only.
                $partyId = $this->partyScopeId();
                $query->join('locations as loc', 'i.location_id', '=', 'loc.id')
                      ->where('loc.party_id', $partyId);
            } else {
                // Company users: company-owned locations only (exclude party locations).
                $query->join('locations as loc', 'i.location_id', '=', 'loc.id')
                      ->whereNull('loc.party_id');
            }

            $total  = $query->count();
            $offset = ($page - 1) * $perPage;

            $rows = (clone $query)
                ->select(
                    'i.id as invoice_id',
                    'i.invoice_number',
                    'i.invoice_date',
                    'i.status',
                    'p.display_name as customer_name',
                    DB::raw('ii.quantity + 0 as quantity'),
                    DB::raw('ii.unit_price + 0 as unit_price'),
                    DB::raw('ii.amount + 0 as total')
                )
                ->orderByDesc('i.invoice_date')
                ->orderByDesc('i.id')
                ->offset($offset)
                ->limit($perPage)
                ->get();

            return response()->json([
                'success' => true,
                'data'    => $rows,
                'meta'    => [
                    'current_page' => $page,
                    'per_page'     => $perPage,
                    'total'        => $total,
                    'last_page'    => max(1, (int) ceil($total / $perPage)),
                ],
            ]);
        } catch (Throwable $e) {
            $this->logException('ItemTransactionsController', $e, []);
            return $this->errorResponse('Failed to fetch transactions.', 500);
        }
    }
}
