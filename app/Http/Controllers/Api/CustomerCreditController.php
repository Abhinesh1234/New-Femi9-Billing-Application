<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerCredit;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerCreditController extends Controller
{
    /**
     * GET /api/customer-credits/balance/{customerId}
     * Returns the customer's total unused credit balance.
     */
    public function balance(Request $request, int $customerId): JsonResponse
    {
        $credits = CustomerCredit::where('customer_id', $customerId)
            ->where('status', 'open')
            ->where('unused_amount', '>', 0)
            ->select('id', 'credit_note_id', 'amount', 'unused_amount', 'created_at')
            ->with('creditNote:id,credit_note_number')
            ->orderBy('created_at')
            ->get();

        $balance = (float) $credits->sum('unused_amount');

        return $this->successResponse([
            'data' => [
                'balance' => $balance,
                'credits' => $credits,
            ],
        ]);
    }

    /**
     * GET /api/customer-credits/available-balance/{customerId}
     * Returns individual rows for each available credit source (excess payments + credit notes).
     */
    public function availableBalance(Request $request, int $customerId): JsonResponse
    {
        $creditNoteRows = CustomerCredit::where('customer_id', $customerId)
            ->where('status', 'open')
            ->where('unused_amount', '>', 0)
            ->with(['creditNote:id,credit_note_number,credit_note_date,location_id', 'creditNote.location:id,name'])
            ->orderBy('created_at')
            ->get()
            ->map(fn ($cc) => [
                'type'               => 'credit_note',
                'id'                 => $cc->id,
                'transaction_number' => $cc->creditNote?->credit_note_number ?? ('CN-' . $cc->credit_note_id),
                'transaction_date'   => $cc->creditNote?->credit_note_date?->toDateString(),
                'location'           => $cc->creditNote?->location?->name,
                'credit_amount'      => (float) $cc->amount,
                'credits_available'  => (float) $cc->unused_amount,
            ]);

        $excessRows = Payment::where('customer_id', $customerId)
            ->where('payment_mode', '!=', 'advance_payment')
            ->where('status', 'open')
            ->where('unused_amount', '>', 0)
            ->with('location:id,name')
            ->orderBy('payment_date')
            ->orderBy('id')
            ->get()
            ->map(fn ($p) => [
                'type'               => 'excess_payment',
                'id'                 => $p->id,
                'transaction_number' => $p->payment_number,
                'transaction_date'   => $p->payment_date?->toDateString(),
                'location'           => $p->location?->name,
                'credit_amount'      => (float) $p->amount,
                'credits_available'  => (float) $p->unused_amount,
            ]);

        $rows                 = $excessRows->merge($creditNoteRows)->values();
        $creditNoteBalance    = (float) $creditNoteRows->sum('credits_available');
        $excessPaymentBalance = (float) $excessRows->sum('credits_available');

        return $this->successResponse([
            'data' => [
                'rows'                   => $rows,
                'total'                  => $creditNoteBalance + $excessPaymentBalance,
                'credit_note_balance'    => $creditNoteBalance,
                'excess_payment_balance' => $excessPaymentBalance,
            ],
        ]);
    }
}
