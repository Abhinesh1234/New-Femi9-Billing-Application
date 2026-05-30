<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\UpdatePaymentRequest;
use App\Http\Traits\EnforcesPartyScope;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentApplication;
use App\Models\Setting;
use App\Models\PaymentRefund;
use App\Models\PaymentAttachment;
use App\Services\ActivityLogger;
use App\Services\StockMovementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class PaymentController extends Controller
{
    use EnforcesPartyScope;

    private const LIST_WITH   = ['customer:id,display_name', 'invoices:id,invoice_number'];
    private const DETAIL_WITH = [
        'customer:id,display_name,mobile',
        'location:id,name,address,website_url,logo_path',
        'invoices:id,invoice_number,invoice_date,grand_total,status',
    ];

    // ── List ──────────────────────────────────────────────────────────────────

    /**
     * GET /api/payments
     */
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PaymentController::index');
        try {
            $query = Payment::with(self::LIST_WITH)
                ->withSum('refunds', 'amount')
                ->search($request->query('search'))
                ->when($this->isPartyUser(), fn ($q) => $q->whereIn(
                    'customer_id',
                    \App\Models\Party::where('parent_party_id', $this->partyScopeId())->pluck('id')
                ))
                ->when(!$this->isPartyUser() && $request->filled('customer_id'), fn ($q) => $q->forCustomer((int) $request->query('customer_id')))
                ->when($request->filled('status'),    fn ($q) => $q->where('status', $request->query('status')))
                ->when($request->filled('from_date'), fn ($q) => $q->whereDate('payment_date', '>=', $request->query('from_date')))
                ->when($request->filled('to_date'),   fn ($q) => $q->whereDate('payment_date', '<=', $request->query('to_date')))
                ->latest('payment_date')
                ->latest('id');

            $perPage = max(1, min((int) $request->query('per_page', 20), 500));
            return $this->successResponse(['data' => $query->paginate($perPage)]);
        } catch (Throwable $e) {
            $this->logException('PaymentController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch payments.', 500);
        }
    }

    // ── Create ────────────────────────────────────────────────────────────────

    /**
     * POST /api/payments
     * Creates a standalone payment (advance) and optionally applies it to an invoice.
     */
    public function store(StorePaymentRequest $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PaymentController::store');
        try {
            $data   = $request->validated();
            $this->resolveCustomerId($data);
            $userId = $request->user()?->id;

            $invoiceId     = $data['invoice_id'] ?? null;
            $appliedAmount = isset($data['applied_amount']) ? (float) $data['applied_amount'] : null;
            $status        = $data['status'] ?? 'open';
            unset($data['invoice_id'], $data['applied_amount'], $data['status']);

            // ── Advance-payment category enforcement ──────────────────────────
            // For customers whose category has advance payment enabled, direct
            // cash/UPI payments may only cover extra charges (total_charges),
            // not the product cost — that must come from advance balance.
            if ($invoiceId && $appliedAmount && $appliedAmount > 0 && $status !== 'draft') {
                $preInvoice = Invoice::with('customer')->find($invoiceId);
                if ($preInvoice) {
                    $catId = $preInvoice->customer?->distribution_category_id;
                    if ($catId) {
                        $invSettings   = Setting::getForModule('invoices') ?? [];
                        $advEnabled    = (bool) ($invSettings['advanced_payment_enabled'] ?? false);
                        $advCategories = array_map('intval', (array) ($invSettings['advanced_payment_categories'] ?? []));

                        if ($advEnabled && in_array((int) $catId, $advCategories, true)) {
                            $chargesTotal   = (float) $preInvoice->total_charges;
                            $existingDirect = (float) PaymentApplication::where('invoice_id', $preInvoice->id)
                                ->join('payments', 'payments.id', '=', 'payment_applications.payment_id')
                                ->where('payments.payment_mode', '!=', 'advance_payment')
                                ->whereNull('payments.deleted_at')
                                ->sum('payment_applications.applied_amount');

                            $maxAllowed = max(0.0, $chargesTotal - $existingDirect);

                            if ($appliedAmount > $maxAllowed + 0.005) {
                                return $this->errorResponse(
                                    'For advance payment customers only extra charges (up to ₹' .
                                    number_format($maxAllowed, 2) .
                                    ') can be recorded as a direct payment. Product cost must be settled via advance balance.',
                                    422
                                );
                            }
                        }
                    }
                }
            }
            // ─────────────────────────────────────────────────────────────────

            DB::beginTransaction();

            $amount  = (float) $data['amount'];
            $payment = Payment::create(array_merge($data, [
                'payment_number' => $this->nextPaymentNumber(),
                'unused_amount'  => $amount,
                'status'         => $status,
                'source'         => $invoiceId ? 'invoice_record' : 'standalone',
                'created_by'     => $userId,
                'updated_by'     => $userId,
            ]));

            // Apply to invoices only when not a draft
            $invoice    = null;
            $oldInvoiceStatus = null;
            if ($status !== 'draft' && $invoiceId && $appliedAmount && $appliedAmount > 0) {
                $invoice = Invoice::findOrFail($invoiceId);
                $oldInvoiceStatus = $invoice->status;
                $apply   = min($appliedAmount, $amount, (float) $invoice->balance_amount);

                if ($apply > 0) {
                    PaymentApplication::create([
                        'payment_id'     => $payment->id,
                        'invoice_id'     => $invoice->id,
                        'applied_amount' => $apply,
                        'applied_by'     => $userId,
                    ]);

                    $payment->recalculateUnused();
                    $invoice->recalculatePayments();
                    $invoice->refresh();
                }
            }

            DB::commit();

            // Activity logs only for confirmed payments
            if ($status !== 'draft') {
                ActivityLogger::paymentReceived($payment, $userId);

                if ($invoice) {
                    ActivityLogger::paymentApplied($payment, $invoice, $appliedAmount, $userId);
                    ActivityLogger::invoiceStatusChanged($invoice, $userId);

                    // Stock: fire if invoice status changed due to this payment
                    $newInvoiceStatus = $invoice->status;
                    if ($oldInvoiceStatus !== $newInvoiceStatus) {
                        app(StockMovementService::class)->onStatusChange(
                            $invoice, $oldInvoiceStatus, $newInvoiceStatus, $userId
                        );
                    }
                }
            }

            // Bust invoice detail cache for any affected invoice
            if ($invoice) Cache::forget("invoice:detail:{$invoice->id}");
            Log::info('[PaymentController::store] Payment created', array_merge($ctx, ['payment_id' => $payment->id]));

            return $this->successResponse(
                ['data' => $payment->fresh(self::DETAIL_WITH)],
                201
            );
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('PaymentController::store', $e, $ctx);
            return $this->errorResponse('Failed to save payment.', 500);
        }
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    /**
     * GET /api/payments/{payment}
     */
    public function show(Request $request, Payment $payment): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PaymentController::show');
        try {
            $this->assertCustomerOwnership((int) $payment->customer_id);
            return $this->successResponse(['data' => $payment->load(self::DETAIL_WITH)]);
        } catch (Throwable $e) {
            $this->logException('PaymentController::show', $e, $ctx);
            return $this->errorResponse('Failed to fetch payment.', 500);
        }
    }

    // ── Update ────────────────────────────────────────────────────────────────

    /**
     * PUT /api/payments/{payment}
     * Only allowed when no applications exist yet.
     */
    public function update(UpdatePaymentRequest $request, Payment $payment): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PaymentController::update');
        try {
            $this->assertCustomerOwnership((int) $payment->customer_id);
            if ($payment->applications()->exists()) {
                return $this->errorResponse(
                    'Cannot edit a payment that has already been applied to invoices.',
                    422
                );
            }

            $data               = $request->validated();
            $data['updated_by'] = $request->user()?->id;

            if (isset($data['amount'])) {
                $data['unused_amount'] = $data['amount'];
            }

            $payment->update($data);

            return $this->successResponse(['data' => $payment->fresh(self::DETAIL_WITH)]);
        } catch (Throwable $e) {
            $this->logException('PaymentController::update', $e, $ctx);
            return $this->errorResponse('Failed to update payment.', 500);
        }
    }

    // ── Delete / Restore ──────────────────────────────────────────────────────

    /**
     * DELETE /api/payments/{payment}
     */
    public function destroy(Request $request, Payment $payment): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PaymentController::destroy');
        try {
            $this->assertCustomerOwnership((int) $payment->customer_id);
            $userId = $request->user()?->id;

            DB::beginTransaction();

            // Collect affected invoices before removing applications
            $affectedInvoices = Invoice::whereIn(
                'id',
                $payment->applications()->pluck('invoice_id')
            )->get();

            // Capture statuses before recalculation
            $oldStatuses = $affectedInvoices->pluck('status', 'id')->all();

            $payment->applications()->delete();

            foreach ($affectedInvoices as $invoice) {
                $invoice->recalculatePayments();
                $invoice->refresh();
                ActivityLogger::paymentUnapplied($payment, $invoice, $userId);
                ActivityLogger::invoiceStatusChanged($invoice, $userId);
            }

            ActivityLogger::paymentDeleted($payment, $userId);

            $payment->delete();

            // Stock: fire for any invoice whose status changed (inside transaction)
            $stock = app(StockMovementService::class);
            foreach ($affectedInvoices as $invoice) {
                $oldStatus = $oldStatuses[$invoice->id] ?? $invoice->status;
                $newStatus = $invoice->status;
                if ($oldStatus !== $newStatus) {
                    $stock->onStatusChange($invoice, $oldStatus, $newStatus, $userId);
                }
            }

            DB::commit();

            // Bust detail cache for all affected invoices
            foreach ($affectedInvoices as $inv) Cache::forget("invoice:detail:{$inv->id}");
            Log::info('[PaymentController::destroy] Payment deleted', array_merge($ctx, ['payment_id' => $payment->id]));

            return $this->successResponse(['message' => 'Payment deleted.']);
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('PaymentController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete payment.', 500);
        }
    }

    /**
     * POST /api/payments/{id}/restore
     */
    public function restore(Request $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PaymentController::restore');
        try {
            $payment = Payment::withTrashed()->findOrFail($id);

            DB::transaction(function () use ($payment) {
                $payment->restore();
                // Recalculate unused amount based on surviving applications
                $payment->recalculateUnused();
            });

            return $this->successResponse(['data' => $payment->fresh(self::DETAIL_WITH)]);
        } catch (Throwable $e) {
            $this->logException('PaymentController::restore', $e, $ctx);
            return $this->errorResponse('Failed to restore payment.', 500);
        }
    }

    // ── Refund ────────────────────────────────────────────────────────────────

    /**
     * POST /api/payments/{payment}/refund
     *
     * Refund flow:
     *  1. Validate refund amount ≤ (payment.amount - already refunded)
     *  2. Consume unused_amount first
     *  3. If refund > unused_amount, peel back payment_applications (newest first)
     *     and recalculate each freed invoice
     *  4. Recalculate payment unused_amount & status
     */
    public function storeRefund(Request $request, Payment $payment): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PaymentController::storeRefund');
        $validated = $request->validate([
            'amount'           => ['required', 'numeric', 'min:0.01'],
            'refunded_on'      => ['required', 'date'],
            'payment_mode'     => ['required', 'string'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'from_account_id'  => ['nullable', 'integer', 'exists:accounts,id'],
            'description'      => ['nullable', 'string'],
        ]);

        try {
            $refundAmount  = (float) $validated['amount'];
            $totalRefunded = (float) $payment->refunds()->sum('amount');
            $maxRefundable = (float) $payment->amount - $totalRefunded;

            if ($refundAmount > $maxRefundable + 0.005) {
                return $this->errorResponse(
                    "Refund amount exceeds the refundable balance of ₹" . number_format($maxRefundable, 2) . ".",
                    422
                );
            }

            $userId = $request->user()?->id;

            DB::beginTransaction();

            // 1. Create the refund record
            $refund = PaymentRefund::create(array_merge($validated, [
                'payment_id' => $payment->id,
                'created_by' => $userId,
            ]));

            // 2. How much exceeds unused_amount (needs reclaiming from applications)
            $toReclaim = max(0, $refundAmount - (float) $payment->unused_amount);

            // 3. Peel back applications newest-first until toReclaim is satisfied
            if ($toReclaim > 0) {
                $applications = $payment->applications()
                    ->with('invoice')
                    ->orderByDesc('id')
                    ->get();

                $affectedInvoiceIds = [];

                foreach ($applications as $app) {
                    if ($toReclaim <= 0) break;

                    $appAmount = (float) $app->applied_amount;
                    $reclaim   = min($appAmount, $toReclaim);

                    if (abs($reclaim - $appAmount) < 0.005) {
                        $app->delete();
                    } else {
                        $app->update(['applied_amount' => $appAmount - $reclaim]);
                    }

                    $affectedInvoiceIds[] = $app->invoice_id;
                    $toReclaim -= $reclaim;
                }

                // Recalculate each affected invoice once
                foreach (array_unique($affectedInvoiceIds) as $invoiceId) {
                    $invoice = Invoice::find($invoiceId);
                    if ($invoice) {
                        $invoice->recalculatePayments();
                        $invoice->refresh();
                        Cache::forget("invoice:detail:{$invoiceId}");
                    }
                }
            }

            // 4. Recalculate payment unused_amount and status (accounts for new refund)
            $payment->recalculateUnused();

            DB::commit();

            Log::info('[PaymentController::storeRefund] Refund created', array_merge($ctx, [
                'payment_id' => $payment->id,
                'refund_id'  => $refund->id,
                'amount'     => $refundAmount,
            ]));

            return $this->successResponse(['data' => $refund->load('fromAccount')], 201);
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('PaymentController::storeRefund', $e, $ctx);
            return $this->errorResponse('Failed to save refund.', 500);
        }
    }

    /**
     * PUT /api/payments/{payment}/refunds/{refund}
     */
    public function updateRefund(Request $request, Payment $payment, PaymentRefund $refund): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PaymentController::updateRefund');

        if ($refund->payment_id !== $payment->id) {
            return $this->errorResponse('Refund not found.', 404);
        }

        $validated = $request->validate([
            'amount'           => ['required', 'numeric', 'min:0.01'],
            'refunded_on'      => ['required', 'date'],
            'payment_mode'     => ['required', 'string'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
        ]);

        try {
            $oldAmount     = (float) $refund->amount;
            $newAmount     = (float) $validated['amount'];
            $otherRefunded = (float) $payment->refunds()->where('id', '!=', $refund->id)->sum('amount');
            $maxRefundable = (float) $payment->amount - $otherRefunded;

            if ($newAmount > $maxRefundable + 0.005) {
                return $this->errorResponse(
                    "Refund amount exceeds the refundable balance of ₹" . number_format($maxRefundable, 2) . ".",
                    422
                );
            }

            DB::beginTransaction();

            $refund->update($validated);

            // If the new amount is larger, may need to peel back applications
            $delta = $newAmount - $oldAmount;
            if ($delta > 0.005) {
                $toReclaim = max(0, $delta - (float) $payment->unused_amount);

                if ($toReclaim > 0) {
                    $applications = $payment->applications()
                        ->with('invoice')
                        ->orderByDesc('id')
                        ->get();

                    $affectedInvoiceIds = [];
                    foreach ($applications as $app) {
                        if ($toReclaim <= 0) break;
                        $appAmount = (float) $app->applied_amount;
                        $reclaim   = min($appAmount, $toReclaim);
                        if (abs($reclaim - $appAmount) < 0.005) {
                            $app->delete();
                        } else {
                            $app->update(['applied_amount' => $appAmount - $reclaim]);
                        }
                        $affectedInvoiceIds[] = $app->invoice_id;
                        $toReclaim -= $reclaim;
                    }

                    foreach (array_unique($affectedInvoiceIds) as $invoiceId) {
                        $invoice = Invoice::find($invoiceId);
                        if ($invoice) {
                            $invoice->recalculatePayments();
                            Cache::forget("invoice:detail:{$invoiceId}");
                        }
                    }
                }
            }

            $payment->recalculateUnused();
            DB::commit();

            return $this->successResponse(['data' => $refund->fresh()]);
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('PaymentController::updateRefund', $e, $ctx);
            return $this->errorResponse('Failed to update refund.', 500);
        }
    }

    /**
     * DELETE /api/payments/{payment}/refunds/{refund}
     */
    public function destroyRefund(Request $request, Payment $payment, PaymentRefund $refund): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PaymentController::destroyRefund');

        if ($refund->payment_id !== $payment->id) {
            return $this->errorResponse('Refund not found.', 404);
        }

        try {
            DB::beginTransaction();
            $refund->delete();
            $payment->recalculateUnused();
            DB::commit();

            return $this->successResponse(['message' => 'Refund deleted.']);
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('PaymentController::destroyRefund', $e, $ctx);
            return $this->errorResponse('Failed to delete refund.', 500);
        }
    }

    /**
     * GET /api/payments/{payment}/refunds
     */
    public function listRefunds(Request $request, Payment $payment): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PaymentController::listRefunds');
        try {
            return $this->successResponse(['data' => $payment->refunds()->with('fromAccount')->latest()->get()]);
        } catch (Throwable $e) {
            $this->logException('PaymentController::listRefunds', $e, $ctx);
            return $this->errorResponse('Failed to fetch refunds.', 500);
        }
    }

    // ── Apply payment to invoice ──────────────────────────────────────────────

    /**
     * POST /api/payments/{payment}/apply
     */
    public function apply(Request $request, Payment $payment): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PaymentController::apply');
        $validated = $request->validate([
            'invoice_id'     => ['required', 'integer', 'exists:invoices,id'],
            'applied_amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        try {
            if ($payment->status === 'draft') {
                return $this->errorResponse('Draft payments cannot be applied to invoices.', 422);
            }

            $invoice = Invoice::findOrFail($validated['invoice_id']);
            $userId  = $request->user()?->id;

            if ($payment->customer_id !== $invoice->customer_id) {
                return $this->errorResponse('Payment customer does not match invoice customer.', 422);
            }

            $apply = min(
                (float) $validated['applied_amount'],
                (float) $payment->unused_amount,
                (float) $invoice->balance_amount
            );

            if ($apply <= 0) {
                return $this->errorResponse('No amount available to apply.', 422);
            }

            $oldInvoiceStatus = $invoice->status;

            DB::beginTransaction();

            $existing = PaymentApplication::where('payment_id', $payment->id)
                ->where('invoice_id', $invoice->id)
                ->first();

            if ($existing) {
                $existing->update(['applied_amount' => $existing->applied_amount + $apply]);
            } else {
                PaymentApplication::create([
                    'payment_id'     => $payment->id,
                    'invoice_id'     => $invoice->id,
                    'applied_amount' => $apply,
                    'applied_by'     => $userId,
                ]);
            }

            $payment->recalculateUnused();
            $invoice->recalculatePayments();
            $invoice->refresh();

            DB::commit();

            ActivityLogger::paymentApplied($payment, $invoice, $apply, $userId);
            ActivityLogger::invoiceStatusChanged($invoice, $userId);

            // Stock: fire if invoice status changed
            $newInvoiceStatus = $invoice->status;
            if ($oldInvoiceStatus !== $newInvoiceStatus) {
                app(StockMovementService::class)->onStatusChange(
                    $invoice, $oldInvoiceStatus, $newInvoiceStatus, $userId
                );
            }

            Cache::forget("invoice:detail:{$invoice->id}");
            Log::info('[PaymentController::apply] Payment applied', array_merge($ctx, ['payment_id' => $payment->id, 'invoice_id' => $invoice->id]));

            return $this->successResponse([
                'data'    => $payment->fresh(self::DETAIL_WITH),
                'invoice' => $invoice->fresh(['paymentApplications']),
            ]);
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('PaymentController::apply', $e, $ctx);
            return $this->errorResponse('Failed to apply payment.', 500);
        }
    }

    /**
     * DELETE /api/payments/{payment}/apply/{invoice}
     */
    public function unapply(Request $request, Payment $payment, Invoice $invoice): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PaymentController::unapply');
        try {
            $userId           = $request->user()?->id;
            $oldInvoiceStatus = $invoice->status;

            DB::beginTransaction();

            PaymentApplication::where('payment_id', $payment->id)
                ->where('invoice_id', $invoice->id)
                ->delete();

            $payment->recalculateUnused();
            $invoice->recalculatePayments();
            $invoice->refresh();

            DB::commit();

            ActivityLogger::paymentUnapplied($payment, $invoice, $userId);
            ActivityLogger::invoiceStatusChanged($invoice, $userId);

            // Stock: fire if invoice status changed due to unapply
            $newInvoiceStatus = $invoice->status;
            if ($oldInvoiceStatus !== $newInvoiceStatus) {
                app(StockMovementService::class)->onStatusChange(
                    $invoice, $oldInvoiceStatus, $newInvoiceStatus, $userId
                );
            }

            Cache::forget("invoice:detail:{$invoice->id}");
            Log::info('[PaymentController::unapply] Payment unapplied', array_merge($ctx, ['payment_id' => $payment->id, 'invoice_id' => $invoice->id]));

            return $this->successResponse(['message' => 'Payment unapplied from invoice.']);
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('PaymentController::unapply', $e, $ctx);
            return $this->errorResponse('Failed to unapply payment.', 500);
        }
    }

    // ── Attachments ───────────────────────────────────────────────────────────

    /**
     * POST /api/payments/{payment}/attachments
     */
    public function uploadAttachment(Request $request, Payment $payment): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PaymentController::uploadAttachment');
        $request->validate([
            'file' => ['required', 'file', 'max:10240', 'mimes:jpeg,jpg,png,gif,pdf,doc,docx,xls,xlsx,csv,txt'],
        ]);

        try {
            $file      = $request->file('file');
            $ext       = strtolower($file->getClientOriginalExtension());
            $mime      = (string) $file->getMimeType();
            $tmpSource = $file->getRealPath();
            $finalSize = $file->getSize();

            $compressedTmp = null;
            if (in_array($mime, ['image/jpeg', 'image/png', 'image/gif'], true) || in_array($ext, ['jpg', 'jpeg', 'png', 'gif'], true)) {
                $compressedTmp = $this->compressImage($tmpSource);
            } elseif ($mime === 'application/pdf' || $ext === 'pdf') {
                $compressedTmp = $this->compressPdf($tmpSource);
            } elseif (in_array($ext, ['doc', 'docx', 'xls', 'xlsx'], true)) {
                $compressedTmp = $this->compressOfficeDoc($tmpSource, $ext);
            }

            $useCompressed = $compressedTmp && file_exists($compressedTmp) && filesize($compressedTmp) < $file->getSize();
            $storePath     = 'payments/' . $payment->id . '/attachments/' . Str::uuid() . '.' . $ext;

            if ($useCompressed) {
                Storage::disk('public')->put($storePath, file_get_contents($compressedTmp));
                $finalSize = filesize($compressedTmp);
                @unlink($compressedTmp);
            } else {
                $file->storeAs(dirname($storePath), basename($storePath), 'public');
                if ($compressedTmp && file_exists($compressedTmp)) @unlink($compressedTmp);
            }

            $attachment = PaymentAttachment::create([
                'payment_id'    => $payment->id,
                'original_name' => $file->getClientOriginalName(),
                'storage_path'  => $storePath,
                'file_size'     => $finalSize,
                'mime_type'     => $mime,
            ]);

            return $this->successResponse(['data' => $attachment], 201);
        } catch (Throwable $e) {
            $this->logException('PaymentController::uploadAttachment', $e, $ctx);
            return $this->errorResponse('Failed to upload attachment.', 500);
        }
    }

    // ── Compression helpers ───────────────────────────────────────────────────

    private function compressImage(string $src): ?string
    {
        if (!extension_loaded('gd')) return null;
        try {
            $info = @getimagesize($src);
            if (!$info) return null;
            $img = match ((int) $info[2]) {
                IMAGETYPE_JPEG => @imagecreatefromjpeg($src),
                IMAGETYPE_PNG  => @imagecreatefrompng($src),
                IMAGETYPE_GIF  => @imagecreatefromgif($src),
                default        => null,
            };
            if (!$img) return null;
            [$w, $h] = [$info[0], $info[1]];
            if ($w > 1200 || $h > 1200) {
                $scale = min(1200 / $w, 1200 / $h);
                $nw = (int) round($w * $scale);
                $nh = (int) round($h * $scale);
                $dst = imagecreatetruecolor($nw, $nh);
                imagecopyresampled($dst, $img, 0, 0, 0, 0, $nw, $nh, $w, $h);
                imagedestroy($img);
                $img = $dst;
            }
            $tmp = tempnam(sys_get_temp_dir(), 'img_') . '.jpg';
            imagejpeg($img, $tmp, 85);
            imagedestroy($img);
            return $tmp;
        } catch (\Throwable) { return null; }
    }

    private function compressPdf(string $src): ?string
    {
        $gs = trim((string) @shell_exec('which gs 2>/dev/null'));
        if (!$gs) return null;
        try {
            $tmp = tempnam(sys_get_temp_dir(), 'pdf_') . '.pdf';
            $cmd = sprintf('%s -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=%s %s 2>/dev/null',
                escapeshellarg($gs), escapeshellarg($tmp), escapeshellarg($src));
            exec($cmd, $out, $code);
            return ($code === 0 && file_exists($tmp)) ? $tmp : null;
        } catch (\Throwable) { return null; }
    }

    private function compressOfficeDoc(string $src, string $ext): ?string
    {
        if (!class_exists('ZipArchive')) return null;
        try {
            $srcZip = new \ZipArchive();
            if ($srcZip->open($src) !== true) return null;
            $tmp = tempnam(sys_get_temp_dir(), 'doc_') . '.' . $ext;
            $dstZip = new \ZipArchive();
            if ($dstZip->open($tmp, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) { $srcZip->close(); return null; }
            for ($i = 0; $i < $srcZip->numFiles; $i++) {
                $name    = (string) $srcZip->getNameIndex($i);
                $content = (string) $srcZip->getFromIndex($i);
                $dstZip->addFromString($name, $content);
                $dstZip->setCompressionName($name, \ZipArchive::CM_DEFLATE, 9);
            }
            $srcZip->close();
            $dstZip->close();
            return $tmp;
        } catch (\Throwable) { return null; }
    }

    /**
     * DELETE /api/payments/{payment}/attachments/{attachment}
     */
    public function deleteAttachment(Request $request, Payment $payment, PaymentAttachment $attachment): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PaymentController::deleteAttachment');
        try {
            if ($attachment->payment_id !== $payment->id) {
                return $this->errorResponse('Attachment does not belong to this payment.', 403);
            }
            Storage::disk('public')->delete($attachment->storage_path);
            $attachment->delete();
            return $this->successResponse(['message' => 'Attachment deleted.']);
        } catch (Throwable $e) {
            $this->logException('PaymentController::deleteAttachment', $e, $ctx);
            return $this->errorResponse('Failed to delete attachment.', 500);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    // ── Next number preview ───────────────────────────────────────────────────

    /**
     * GET /api/payments/next-number
     */
    public function nextNumber(): JsonResponse
    {
        $max = Payment::withTrashed()->max('id') ?? 0;
        return response()->json([
            'success' => true,
            'data'    => ['payment_number' => 'PMT-' . str_pad($max + 1, 6, '0', STR_PAD_LEFT)],
        ]);
    }

    public function advanceBalance(int $customerId): JsonResponse
    {
        $balance = Payment::where('customer_id', $customerId)
            ->where('payment_mode', 'advance_payment')
            ->where('status', 'open')
            ->sum('unused_amount');

        return response()->json([
            'success' => true,
            'data'    => ['balance' => round((float) $balance, 2)],
        ]);
    }

    private function nextPaymentNumber(): string
    {
        $max = Payment::withTrashed()->lockForUpdate()->max('id') ?? 0;
        return 'PMT-' . str_pad($max + 1, 6, '0', STR_PAD_LEFT);
    }
}
