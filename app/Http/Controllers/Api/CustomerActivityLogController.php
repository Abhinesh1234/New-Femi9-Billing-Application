<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class CustomerActivityLogController extends Controller
{
    /**
     * GET /api/parties/{customerId}/activity
     *
     * Returns the full chronological activity timeline for a customer.
     * Supports filtering by event_type, subject_type, and date range.
     */
    public function index(Request $request, int $customerId): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CustomerActivityLogController::index');
        try {
            $query = CustomerActivityLog::with('performer:id,name')
                ->forCustomer($customerId)
                ->when(
                    $request->filled('event_type'),
                    fn ($q) => $q->where('event_type', $request->query('event_type'))
                )
                ->when(
                    $request->filled('subject_type'),
                    fn ($q) => $q->where('subject_type', $request->query('subject_type'))
                )
                ->when(
                    $request->filled('from_date'),
                    fn ($q) => $q->whereDate('created_at', '>=', $request->query('from_date'))
                )
                ->when(
                    $request->filled('to_date'),
                    fn ($q) => $q->whereDate('created_at', '<=', $request->query('to_date'))
                )
                ->latestFirst();

            $perPage = max(1, min((int) $request->query('per_page', 50), 200));
            return $this->successResponse(['data' => $query->paginate($perPage)]);
        } catch (Throwable $e) {
            $this->logException('CustomerActivityLogController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch activity log.', 500);
        }
    }

    /**
     * GET /api/invoices/{invoiceId}/activity
     *
     * All activity events where this invoice is the subject or the related entity.
     */
    public function forInvoice(Request $request, int $invoiceId): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CustomerActivityLogController::forInvoice');
        try {
            $logs = CustomerActivityLog::with('performer:id,name')
                ->where(function ($q) use ($invoiceId) {
                    $q->where(fn ($q2) => $q2->where('subject_type', 'invoice')->where('subject_id', $invoiceId))
                      ->orWhere(fn ($q2) => $q2->where('related_type', 'invoice')->where('related_id', $invoiceId));
                })
                ->latestFirst()
                ->get();

            return $this->successResponse(['data' => $logs]);
        } catch (Throwable $e) {
            $this->logException('CustomerActivityLogController::forInvoice', $e, $ctx);
            return $this->errorResponse('Failed to fetch invoice activity.', 500);
        }
    }

    /**
     * GET /api/payments/{paymentId}/activity
     *
     * All activity events where this payment is the subject or related entity.
     */
    public function forPayment(Request $request, int $paymentId): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CustomerActivityLogController::forPayment');
        try {
            $logs = CustomerActivityLog::with('performer:id,name')
                ->where(function ($q) use ($paymentId) {
                    $q->where(fn ($q2) => $q2->where('subject_type', 'payment')->where('subject_id', $paymentId))
                      ->orWhere(fn ($q2) => $q2->where('related_type', 'payment')->where('related_id', $paymentId));
                })
                ->latestFirst()
                ->get();

            return $this->successResponse(['data' => $logs]);
        } catch (Throwable $e) {
            $this->logException('CustomerActivityLogController::forPayment', $e, $ctx);
            return $this->errorResponse('Failed to fetch payment activity.', 500);
        }
    }

    /**
     * GET /api/credit-notes/{creditNoteId}/activity
     *
     * All activity events where this credit note is the subject or related entity.
     */
    public function forCreditNote(Request $request, int $creditNoteId): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CustomerActivityLogController::forCreditNote');
        try {
            $logs = CustomerActivityLog::with('performer:id,name')
                ->where(function ($q) use ($creditNoteId) {
                    $q->where(fn ($q2) => $q2->where('subject_type', 'credit_note')->where('subject_id', $creditNoteId))
                      ->orWhere(fn ($q2) => $q2->where('related_type', 'credit_note')->where('related_id', $creditNoteId));
                })
                ->latestFirst()
                ->get();

            return $this->successResponse(['data' => $logs]);
        } catch (Throwable $e) {
            $this->logException('CustomerActivityLogController::forCreditNote', $e, $ctx);
            return $this->errorResponse('Failed to fetch credit note activity.', 500);
        }
    }
}
