<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Http\Traits\EnforcesPartyScope;
use App\Models\Invoice;
use App\Models\InvoiceAttachment;
use App\Models\Payment;
use App\Models\PaymentApplication;
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

class InvoiceController extends Controller
{
    use EnforcesPartyScope;

    private const LIST_WITH  = ['customer:id,display_name,distribution_category_id', 'customer.distributionCategory:id,name', 'location:id,name'];
    private static function detailWith(): array
    {
        return [
            'customer:id,display_name,mobile,gst,distribution_category_id',
            'location:id,name,address,logo_path,website_url',
            'reference:id,name,phone',
            'tax:id,name,rate',
            'items',
            'attachments',
            'payments' => fn ($q) => $q->select('payments.id', 'payments.payment_number', 'payments.payment_date', 'payments.amount', 'payments.payment_mode', 'payments.source')
                                       ->withPivot('applied_amount', 'applied_at'),
        ];
    }

    // ── List ──────────────────────────────────────────────────────────────────

    /**
     * GET /api/invoices
     */
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'InvoiceController::index');
        try {
            $base  = $request->boolean('trashed') ? Invoice::onlyTrashed() : Invoice::query();
            $query = $base->with(self::LIST_WITH)
                ->search($request->query('search'))
                ->ofStatus($request->query('status'))
                ->when($this->isPartyUser(), fn ($q) => $q->whereIn(
                    'customer_id',
                    \App\Models\Party::where('parent_party_id', $this->partyScopeId())->pluck('id')
                ))
                ->when(!$this->isPartyUser() && $request->filled('customer_id'), fn ($q) => $q->where('customer_id', $request->query('customer_id')))
                ->when($request->filled('distribution_category_id'), fn ($q) => $q->whereHas('customer', fn ($cq) => $cq->where('distribution_category_id', $request->query('distribution_category_id'))))
                ->when($request->filled('from_date'), fn ($q) => $q->whereDate('invoice_date', '>=', $request->query('from_date')))
                ->when($request->filled('to_date'),   fn ($q) => $q->whereDate('invoice_date', '<=', $request->query('to_date')))
                ->latest('invoice_date')
                ->latest('id');

            $perPage = max(1, min((int) $request->query('per_page', 20), 500));
            return $this->successResponse(['data' => $query->paginate($perPage)]);
        } catch (Throwable $e) {
            $this->logException('InvoiceController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch invoices.', 500);
        }
    }

    // ── Create ────────────────────────────────────────────────────────────────

    /**
     * POST /api/invoices
     */
    public function store(StoreInvoiceRequest $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'InvoiceController::store');
        try {
            $data     = $request->validated();
            $items    = $data['items'];
            $payments = $data['payments'] ?? [];
            unset($data['items'], $data['payments']);

            // Party users can only create invoices for themselves
            $this->resolveCustomerId($data);

            $userId = $request->user()?->id;
            $data['created_by']     = $userId;
            $data['updated_by']     = $userId;
            $data['status']         = $data['status'] ?? 'sent';
            $data['total_paid']     = 0;
            $data['balance_amount'] = $data['grand_total'];

            DB::beginTransaction();

            // 1. Create invoice
            $invoice = Invoice::create($data);

            // 2. Create line items
            foreach ($items as $i => $itemData) {
                $invoice->items()->create(array_merge($itemData, [
                    'sort_order' => $itemData['sort_order'] ?? $i,
                ]));
            }

            // 3. Create payments + applications if "I have received payment" was checked
            $totalPaid = 0;
            foreach ($payments as $paymentData) {
                $amount = (float) $paymentData['amount'];

                if ($paymentData['payment_mode'] === 'advance_payment') {
                    // Apply from existing advance payment records (FIFO) instead of creating a new payment
                    $advancePayments = Payment::where('customer_id', $invoice->customer_id)
                        ->where('payment_mode', 'advance_payment')
                        ->where('status', 'open')
                        ->where('unused_amount', '>', 0)
                        ->orderBy('payment_date')
                        ->orderBy('id')
                        ->lockForUpdate()
                        ->get();

                    $totalAvailable = $advancePayments->sum('unused_amount');
                    if ((float) $totalAvailable < $amount - 0.01) {
                        DB::rollBack();
                        return $this->errorResponse(
                            'Insufficient advance payment balance. Available: ₹' . number_format($totalAvailable, 2) . ', Required: ₹' . number_format($amount, 2) . '.',
                            422
                        );
                    }

                    $remaining = $amount;
                    foreach ($advancePayments as $ap) {
                        if ($remaining <= 0.005) break;
                        $apply = min(round($remaining, 2), round((float) $ap->unused_amount, 2));
                        PaymentApplication::create([
                            'payment_id'     => $ap->id,
                            'invoice_id'     => $invoice->id,
                            'applied_amount' => $apply,
                            'applied_by'     => $userId,
                        ]);
                        $ap->recalculateUnused();
                        $remaining -= $apply;
                        ActivityLogger::paymentApplied($ap, $invoice, $apply, $userId);
                    }
                } else {
                    $payment = Payment::create([
                        'payment_number'   => $this->nextPaymentNumber(),
                        'customer_id'      => $invoice->customer_id,
                        'location_id'      => $invoice->location_id,
                        'payment_date'     => $invoice->invoice_date,
                        'amount'           => $amount,
                        'unused_amount'    => 0,
                        'payment_mode'     => $paymentData['payment_mode'],
                        'reference_number' => $paymentData['reference_number'] ?? null,
                        'status'           => 'closed',
                        'created_by'       => $userId,
                        'updated_by'       => $userId,
                    ]);

                    PaymentApplication::create([
                        'payment_id'     => $payment->id,
                        'invoice_id'     => $invoice->id,
                        'applied_amount' => $amount,
                        'applied_by'     => $userId,
                    ]);

                    ActivityLogger::paymentReceived($payment, $userId);
                    ActivityLogger::paymentApplied($payment, $invoice, $amount, $userId);
                }

                $totalPaid += $amount;
            }

            // 4. Update invoice payment tracking if payments were provided
            if ($totalPaid > 0) {
                $newStatus = $totalPaid >= (float) $data['grand_total'] ? 'paid' : 'partially_paid';
                $invoice->updateQuietly([
                    'total_paid'     => $totalPaid,
                    'balance_amount' => max(0, (float) $data['grand_total'] - $totalPaid),
                    'status'         => $newStatus,
                ]);
                $invoice->refresh();
            }

            // 5. Increment the series current_number so the next invoice gets the next number
            if ($invoice->series_id) {
                $seriesModule = \App\Models\TransactionSeriesModule::where('series_id', $invoice->series_id)
                    ->lockForUpdate()
                    ->first();
                if ($seriesModule) {
                    $mod = $seriesModule->getModule('Invoice');
                    if ($mod) {
                        // Use the suffix of the just-saved invoice number as the baseline
                        $prefix     = (string) ($mod['prefix'] ?? '');
                        $savedNum   = $prefix !== '' && str_starts_with($invoice->invoice_number, $prefix)
                            ? (int) substr($invoice->invoice_number, strlen($prefix))
                            : (int) ($mod['current_number'] ?? 1);
                        $next       = max((int) ($mod['current_number'] ?? 1), $savedNum) + 1;
                        $seriesModule->updateModule('Invoice', ['current_number' => $next]);
                    }
                }
            }

            // 6. Stock movements inside transaction — treat creation as transitioning from draft
            $finalStatus = $invoice->status;
            if ($finalStatus !== 'draft') {
                app(StockMovementService::class)->onStatusChange(
                    $invoice, 'draft', $finalStatus, $userId
                );
            }

            DB::commit();

            // Activity logs written after commit so they reflect final state
            ActivityLogger::invoiceCreated($invoice, $userId);
            if ($totalPaid > 0) {
                ActivityLogger::invoiceStatusChanged($invoice, $userId);
            }

            Log::info('[InvoiceController::store] Invoice created', array_merge($ctx, ['invoice_id' => $invoice->id, 'invoice_number' => $invoice->invoice_number]));

            return $this->successResponse(
                ['data' => $invoice->load(self::detailWith())],
                201
            );
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('InvoiceController::store', $e, $ctx);
            return $this->errorResponse('Failed to save invoice.', 500);
        }
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    /**
     * GET /api/invoices/{invoice}
     */
    public function show(Request $request, Invoice $invoice): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'InvoiceController::show');
        try {
            $this->assertCustomerOwnership((int) $invoice->customer_id);
            $cacheKey = "invoice:detail:{$invoice->id}";
            $data = Cache::remember($cacheKey, 300, fn () => $invoice->load(self::detailWith()));
            $arr = $data->toArray();
            $arr['is_fully_credited'] = $this->computeIsFullyCredited($invoice->id);
            return $this->successResponse(['data' => $arr]);
        } catch (Throwable $e) {
            $this->logException('InvoiceController::show', $e, $ctx);
            return $this->errorResponse('Failed to fetch invoice.', 500);
        }
    }

    private function computeIsFullyCredited(int $invoiceId): bool
    {
        $invoiceItems = \App\Models\InvoiceItem::where('invoice_id', $invoiceId)->get();
        if ($invoiceItems->isEmpty()) return false;

        $creditedRows = DB::table('credit_note_items as cni')
            ->join('credit_notes as cn', 'cn.id', '=', 'cni.credit_note_id')
            ->where('cn.source_invoice_id', $invoiceId)
            ->whereNull('cn.deleted_at')
            ->select('cni.item_id', 'cni.item_name', DB::raw('SUM(cni.quantity) as credited_qty'))
            ->groupBy('cni.item_id', 'cni.item_name')
            ->get();

        $byId   = $creditedRows->whereNotNull('item_id')->keyBy('item_id');
        $byName = $creditedRows->whereNull('item_id')->keyBy('item_name');

        foreach ($invoiceItems as $item) {
            $invoiceQty = (float) $item->quantity;
            if ($item->item_id && $byId->has($item->item_id)) {
                $creditedQty = (float) $byId->get($item->item_id)->credited_qty;
            } elseif (!$item->item_id && $byName->has($item->item_name)) {
                $creditedQty = (float) $byName->get($item->item_name)->credited_qty;
            } else {
                $creditedQty = 0;
            }
            if ($creditedQty < $invoiceQty) return false;
        }

        return true;
    }

    // ── Update ────────────────────────────────────────────────────────────────

    /**
     * PUT /api/invoices/{invoice}
     */
    public function update(UpdateInvoiceRequest $request, Invoice $invoice): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'InvoiceController::update');
        try {
            $this->assertCustomerOwnership((int) $invoice->customer_id);
            $data  = $request->validated();
            $items = $data['items'] ?? null;
            unset($data['items']);

            $userId    = $request->user()?->id;
            $oldStatus = $invoice->status;
            $data['updated_by'] = $userId;

            // JSON column safety — skip charges_json write if content is unchanged (order-insensitive)
            if (array_key_exists('charges_json', $data)) {
                $normalize = fn ($arr) => collect((array) $arr)
                    ->sortBy([['label', 'asc'], ['amount', 'asc']])
                    ->values()->toArray();
                if (json_encode($normalize($invoice->charges_json ?? [])) === json_encode($normalize($data['charges_json'] ?? []))) {
                    unset($data['charges_json']);
                }
            }

            // Snapshot before-state for the activity diff
            $oldData = [
                'invoice_date' => $invoice->invoice_date?->toDateString(),
                'due_date'     => $invoice->due_date?->toDateString(),
                'grand_total'  => (float) $invoice->grand_total,
                'status'       => $invoice->status,
            ];
            $oldItems = $items !== null
                ? $invoice->items->map(fn ($it) => [
                    'item_name'  => $it->item_name,
                    'quantity'   => (float) $it->quantity,
                    'unit_price' => (float) $it->unit_price,
                    'amount'     => (float) $it->amount,
                ])->toArray()
                : [];

            DB::beginTransaction();

            $invoice->update($data);

            if ($items !== null) {
                $invoice->items()->delete();
                foreach ($items as $i => $itemData) {
                    $invoice->items()->create(array_merge($itemData, [
                        'sort_order' => $itemData['sort_order'] ?? $i,
                    ]));
                }
                $invoice->recalculatePayments();
            }

            $invoice->refresh();
            $newStatus = $invoice->status;

            // Stock: handle item changes and/or status changes (inside transaction)
            $stock = app(StockMovementService::class);
            if ($items !== null) {
                $stock->onItemsChanged($invoice, $items, $userId);
            } elseif ($oldStatus !== $newStatus) {
                $stock->onStatusChange($invoice, $oldStatus, $newStatus, $userId);
            }

            DB::commit();

            ActivityLogger::invoiceUpdated($invoice, $userId, $oldData, $oldItems, $items);

            if ($oldStatus !== $newStatus) {
                ActivityLogger::invoiceStatusChanged($invoice, $userId);
            }

            Cache::forget("invoice:detail:{$invoice->id}");
            Log::info('[InvoiceController::update] Invoice updated', array_merge($ctx, ['invoice_id' => $invoice->id]));

            return $this->successResponse(['data' => $invoice->fresh(self::detailWith())]);
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('InvoiceController::update', $e, $ctx);
            return $this->errorResponse('Failed to update invoice.', 500);
        }
    }

    // ── Delete / Restore ──────────────────────────────────────────────────────

    /**
     * DELETE /api/invoices/{invoice}
     */
    public function destroy(Request $request, Invoice $invoice): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'InvoiceController::destroy');
        try {
            $this->assertCustomerOwnership((int) $invoice->customer_id);
            $userId = $request->user()?->id;

            // Capture before soft-delete clears access
            $snapshot = $invoice->replicate();
            $snapshot->id = $invoice->id;

            DB::transaction(function () use ($invoice, $userId) {
                // Reverse stock before deleting so items are still accessible
                app(StockMovementService::class)->onDeleted($invoice, $userId);
                $invoice->delete();
            });

            ActivityLogger::invoiceVoided($snapshot, $userId);
            Cache::forget("invoice:detail:{$invoice->id}");
            Log::info('[InvoiceController::destroy] Invoice deleted', array_merge($ctx, ['invoice_id' => $invoice->id]));

            return $this->successResponse(['message' => 'Invoice deleted.']);
        } catch (Throwable $e) {
            $this->logException('InvoiceController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete invoice.', 500);
        }
    }

    /**
     * PATCH /api/invoices/{invoice}/void
     *
     * Sets status to 'void' and reverses all stock movements.
     * Blocked when: already voided, soft-deleted, draft, or payments applied.
     */
    public function void(Request $request, Invoice $invoice): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'InvoiceController::void');
        try {
            if ($invoice->status === 'void') {
                return $this->errorResponse('Invoice is already voided.', 422);
            }
            if ($invoice->status === 'draft') {
                return $this->errorResponse('Draft invoices cannot be voided. Delete it instead.', 422);
            }
            $totalSettled = (float) $invoice->total_paid + (float) ($invoice->credit_applied ?? 0);
            if ($totalSettled > 0) {
                return $this->errorResponse(
                    "Remove all payments and credit applications (₹" . number_format($totalSettled, 2) . ") before voiding this invoice.",
                    422
                );
            }

            $userId    = $request->user()?->id;
            $oldStatus = $invoice->status;

            DB::transaction(function () use ($invoice, $oldStatus, $userId) {
                $invoice->update(['status' => 'void', 'updated_by' => $userId]);
                app(StockMovementService::class)->onStatusChange($invoice, $oldStatus, 'void', $userId);
            });

            ActivityLogger::invoiceVoided($invoice, $userId);
            Cache::forget("invoice:detail:{$invoice->id}");
            Log::info('[InvoiceController::void] Invoice voided', array_merge($ctx, ['invoice_id' => $invoice->id]));

            return $this->successResponse(['data' => $invoice->fresh(self::detailWith())]);
        } catch (Throwable $e) {
            $this->logException('InvoiceController::void', $e, $ctx);
            return $this->errorResponse('Failed to void invoice.', 500);
        }
    }

    /**
     * POST /api/invoices/{id}/restore
     */
    public function restore(Request $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'InvoiceController::restore');
        try {
            $invoice = Invoice::withTrashed()->findOrFail($id);
            $userId  = $request->user()?->id;
            DB::transaction(function () use ($invoice, $userId) {
                $invoice->restore();
                app(StockMovementService::class)->onRestored($invoice, $userId);
            });
            Cache::forget("invoice:detail:{$invoice->id}");
            Log::info('[InvoiceController::restore] Invoice restored', array_merge($ctx, ['invoice_id' => $invoice->id]));
            return $this->successResponse(['data' => $invoice->load(self::detailWith())]);
        } catch (ModelNotFoundException) {
            return $this->errorResponse('Invoice not found.', 404);
        } catch (Throwable $e) {
            $this->logException('InvoiceController::restore', $e, $ctx);
            return $this->errorResponse('Failed to restore invoice.', 500);
        }
    }

    // ── Attachments ───────────────────────────────────────────────────────────

    /**
     * POST /api/invoices/{invoice}/attachments
     */
    public function uploadAttachment(Request $request, Invoice $invoice): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'InvoiceController::uploadAttachment');
        $request->validate([
            'file' => ['required', 'file', 'max:10240', 'mimes:jpeg,jpg,png,gif,pdf,doc,docx,xls,xlsx,csv,txt'],
        ]);

        try {
            $file      = $request->file('file');
            $ext       = strtolower($file->getClientOriginalExtension());
            $mime      = (string) $file->getMimeType();
            $tmpSource = $file->getRealPath();
            $finalSize = $file->getSize();

            // Attempt compression; fall back to original if it fails or is larger
            $compressedTmp = null;
            if (in_array($mime, ['image/jpeg', 'image/png', 'image/gif'], true) || in_array($ext, ['jpg', 'jpeg', 'png', 'gif'], true)) {
                $compressedTmp = $this->compressImage($tmpSource);
            } elseif ($mime === 'application/pdf' || $ext === 'pdf') {
                $compressedTmp = $this->compressPdf($tmpSource);
            } elseif (in_array($ext, ['doc', 'docx', 'xls', 'xlsx'], true)) {
                $compressedTmp = $this->compressOfficeDoc($tmpSource, $ext);
            }

            $useCompressed = $compressedTmp && file_exists($compressedTmp) && filesize($compressedTmp) < $file->getSize();
            $storePath     = 'invoices/' . $invoice->id . '/attachments/' . Str::uuid() . '.' . $ext;

            if ($useCompressed) {
                Storage::disk('public')->put($storePath, file_get_contents($compressedTmp));
                $finalSize = filesize($compressedTmp);
                @unlink($compressedTmp);
            } else {
                $file->storeAs(dirname($storePath), basename($storePath), 'public');
                if ($compressedTmp && file_exists($compressedTmp)) @unlink($compressedTmp);
            }

            $attachment = InvoiceAttachment::create([
                'invoice_id'    => $invoice->id,
                'original_name' => $file->getClientOriginalName(),
                'storage_path'  => $storePath,
                'file_size'     => $finalSize,
                'mime_type'     => $mime,
            ]);

            return $this->successResponse(['data' => $attachment], 201);
        } catch (Throwable $e) {
            $this->logException('InvoiceController::uploadAttachment', $e, $ctx);
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
     * DELETE /api/invoices/{invoice}/attachments/{attachment}
     */
    public function deleteAttachment(Request $request, Invoice $invoice, InvoiceAttachment $attachment): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'InvoiceController::deleteAttachment');
        try {
            if ($attachment->invoice_id !== $invoice->id) {
                return $this->errorResponse('Attachment does not belong to this invoice.', 403);
            }
            Storage::disk('public')->delete($attachment->storage_path);
            $attachment->delete();
            return $this->successResponse(['message' => 'Attachment deleted.']);
        } catch (Throwable $e) {
            $this->logException('InvoiceController::deleteAttachment', $e, $ctx);
            return $this->errorResponse('Failed to delete attachment.', 500);
        }
    }

    // ── Stock impact preview ──────────────────────────────────────────────────

    /**
     * POST /api/invoices/{invoice}/stock-impact
     * Body: { items: [...] }
     * Returns warnings for any items that would go negative after edit.
     */
    public function stockImpact(Request $request, Invoice $invoice): JsonResponse
    {
        $validated = $request->validate([
            'items'                => ['required', 'array'],
            'items.*.item_id'      => ['nullable', 'integer'],
            'items.*.quantity'     => ['required', 'numeric', 'min:0'],
        ]);

        $warnings = app(StockMovementService::class)->previewImpact($invoice, $validated['items']);

        return $this->successResponse(['warnings' => $warnings]);
    }

    // ── Apply advance balance ─────────────────────────────────────────────────

    /**
     * POST /api/invoices/{invoice}/apply-advance
     * Consumes the customer's advance payment balance (FIFO) and applies it to this invoice.
     */
    public function applyAdvance(Request $request, Invoice $invoice): JsonResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        $invoiceBalance = (float) $invoice->balance_amount;
        if ($invoiceBalance <= 0.005) {
            return $this->errorResponse('This invoice has no outstanding balance.', 422);
        }

        if (!$invoice->customer_id) {
            return $this->errorResponse('Invoice has no customer.', 422);
        }

        try {
            return DB::transaction(function () use ($request, $invoice, $validated, $invoiceBalance) {
                $userId = $request->user()?->id;

                // Lock and fetch open advance payments FIFO
                $advancePayments = Payment::where('customer_id', $invoice->customer_id)
                    ->where('payment_mode', 'advance_payment')
                    ->where('status', 'open')
                    ->where('unused_amount', '>', 0)
                    ->orderBy('payment_date')
                    ->orderBy('id')
                    ->lockForUpdate()
                    ->get();

                $totalAvailable = (float) $advancePayments->sum('unused_amount');
                if ($totalAvailable <= 0.005) {
                    return $this->errorResponse('No advance balance available for this customer.', 422);
                }

                $toApply   = min((float) $validated['amount'], $invoiceBalance, $totalAvailable);
                $remaining = $toApply;
                $oldStatus = $invoice->status;

                foreach ($advancePayments as $payment) {
                    if ($remaining <= 0.005) break;

                    $available = (float) $payment->unused_amount;
                    $apply     = min($remaining, $available);

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
                    $remaining -= $apply;
                }

                $invoice->recalculatePayments();
                $invoice->refresh();

                $newStatus = $invoice->status;
                if ($oldStatus !== $newStatus) {
                    app(StockMovementService::class)->onStatusChange(
                        $invoice, $oldStatus, $newStatus, $userId
                    );
                }

                Cache::forget("invoice:detail:{$invoice->id}");

                return $this->successResponse([
                    'message' => 'Advance balance applied successfully.',
                    'data'    => $invoice->fresh(self::detailWith()),
                    'applied' => round($toApply - max(0, $remaining), 2),
                ]);
            });
        } catch (Throwable $e) {
            Log::error('[InvoiceController::applyAdvance] Failed', [
                'invoice_id' => $invoice->id,
                'error'      => $e->getMessage(),
                'line'       => $e->getLine(),
            ]);
            return $this->errorResponse('Failed to apply advance balance. Please try again.', 500);
        }
    }

    // ── Apply customer credit to invoice ─────────────────────────────────────

    /**
     * POST /api/invoices/{invoice}/apply-credit
     * Consumes customer's unused credit balance (FIFO) and applies it to this invoice.
     */
    public function applyCredit(Request $request, Invoice $invoice): JsonResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        $invoiceBalance = (float) $invoice->balance_amount;
        if ($invoiceBalance <= 0.005) {
            return $this->errorResponse('This invoice has no outstanding balance.', 422);
        }
        if (!$invoice->customer_id) {
            return $this->errorResponse('Invoice has no customer.', 422);
        }

        try {
            return DB::transaction(function () use ($request, $invoice, $validated, $invoiceBalance) {
                $userId = $request->user()?->id;

                // Lock and fetch open customer credits FIFO
                $credits = \App\Models\CustomerCredit::where('customer_id', $invoice->customer_id)
                    ->where('status', 'open')
                    ->where('unused_amount', '>', 0)
                    ->orderBy('created_at')
                    ->orderBy('id')
                    ->lockForUpdate()
                    ->get();

                $totalAvailable = (float) $credits->sum('unused_amount');
                if ($totalAvailable <= 0.005) {
                    return $this->errorResponse('No credit balance available for this customer.', 422);
                }

                $toApply   = min((float) $validated['amount'], $invoiceBalance, $totalAvailable);
                $remaining = $toApply;
                $oldStatus = $invoice->status;

                foreach ($credits as $credit) {
                    if ($remaining <= 0.005) break;
                    $available = (float) $credit->unused_amount;
                    $apply     = min($remaining, $available);

                    $existing = \App\Models\CreditApplication::where('customer_credit_id', $credit->id)
                        ->where('invoice_id', $invoice->id)
                        ->first();

                    if ($existing) {
                        $existing->update(['applied_amount' => $existing->applied_amount + $apply]);
                    } else {
                        \App\Models\CreditApplication::create([
                            'customer_credit_id' => $credit->id,
                            'invoice_id'         => $invoice->id,
                            'applied_amount'     => $apply,
                            'applied_by'         => $userId,
                        ]);
                    }

                    $credit->recalculateUnused();
                    $remaining -= $apply;
                }

                $invoice->recalculatePayments();
                $invoice->refresh();

                $newStatus = $invoice->status;
                if ($oldStatus !== $newStatus) {
                    app(StockMovementService::class)->onStatusChange(
                        $invoice, $oldStatus, $newStatus, $userId
                    );
                }

                Cache::forget("invoice:detail:{$invoice->id}");

                return $this->successResponse([
                    'message' => 'Credit balance applied successfully.',
                    'data'    => $invoice->fresh(self::detailWith()),
                    'applied' => round($toApply - max(0, $remaining), 2),
                ]);
            });
        } catch (Throwable $e) {
            Log::error('[InvoiceController::applyCredit] Failed', [
                'invoice_id' => $invoice->id,
                'error'      => $e->getMessage(),
            ]);
            return $this->errorResponse('Failed to apply credit balance. Please try again.', 500);
        }
    }

    // ── Apply all available credits (credit notes + excess payments) ─────────

    /**
     * POST /api/invoices/{invoice}/apply-available-credits
     * Applies per-row credits: each row specifies { type, id, amount }.
     */
    public function applyAvailableCredits(Request $request, Invoice $invoice): JsonResponse
    {
        $validated = $request->validate([
            'credits'          => ['required', 'array', 'min:1'],
            'credits.*.type'   => ['required', 'string', 'in:credit_note,excess_payment'],
            'credits.*.id'     => ['required', 'integer', 'min:1'],
            'credits.*.amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        $invoiceBalance = (float) $invoice->balance_amount;
        if ($invoiceBalance <= 0.005) {
            return $this->errorResponse('This invoice has no outstanding balance.', 422);
        }
        if (!$invoice->customer_id) {
            return $this->errorResponse('Invoice has no customer.', 422);
        }

        // For advance-payment customers, credits may only offset extra charges
        $invoice->load('customer');
        $catId          = (int) ($invoice->customer?->distribution_category_id ?? 0);
        $setting        = \App\Models\Setting::getForModule('invoices') ?? [];
        $advCats        = array_map('intval', (array) ($setting['advanced_payment_categories'] ?? []));
        $advEnabled     = (bool) ($setting['advanced_payment_enabled'] ?? false);
        $isAdvanceCust  = $advEnabled && $catId && in_array($catId, $advCats);

        $creditsCap = $invoiceBalance;
        if ($isAdvanceCust) {
            // Recompute charges remaining (chargesTotal - direct payments already applied)
            $chargesTotal   = (float) $invoice->total_charges;
            $directPaid     = PaymentApplication::where('invoice_id', $invoice->id)
                ->whereHas('payment', fn ($q) => $q->where('payment_mode', '!=', 'advance_payment'))
                ->sum('applied_amount');
            $creditsCap = max(0, $chargesTotal - (float) $directPaid);
            if ($creditsCap <= 0.005) {
                return $this->errorResponse('Extra charges are already fully covered. Credits cannot be applied.', 422);
            }
        }

        try {
            return DB::transaction(function () use ($request, $invoice, $validated, $invoiceBalance, $creditsCap) {
                $userId       = $request->user()?->id;
                $remaining    = $creditsCap;
                $totalApplied = 0;
                $oldStatus    = $invoice->status;

                foreach ($validated['credits'] as $creditRow) {
                    $requestedAmt = (float) $creditRow['amount'];
                    $apply        = min($requestedAmt, $remaining);
                    if ($apply <= 0.005) continue;

                    if ($creditRow['type'] === 'credit_note') {
                        $credit = \App\Models\CustomerCredit::where('customer_id', $invoice->customer_id)
                            ->where('id', $creditRow['id'])
                            ->where('status', 'open')
                            ->where('unused_amount', '>', 0)
                            ->lockForUpdate()
                            ->first();

                        if (!$credit) continue;

                        $apply = min($apply, (float) $credit->unused_amount);
                        if ($apply <= 0.005) continue;

                        $existing = \App\Models\CreditApplication::where('customer_credit_id', $credit->id)
                            ->where('invoice_id', $invoice->id)->first();

                        if ($existing) {
                            $existing->update(['applied_amount' => $existing->applied_amount + $apply]);
                        } else {
                            \App\Models\CreditApplication::create([
                                'customer_credit_id' => $credit->id,
                                'invoice_id'         => $invoice->id,
                                'applied_amount'     => $apply,
                                'applied_by'         => $userId,
                            ]);
                        }

                        $credit->recalculateUnused();

                    } elseif ($creditRow['type'] === 'excess_payment') {
                        $payment = Payment::where('customer_id', $invoice->customer_id)
                            ->where('id', $creditRow['id'])
                            ->where('payment_mode', '!=', 'advance_payment')
                            ->where('status', 'open')
                            ->where('unused_amount', '>', 0)
                            ->lockForUpdate()
                            ->first();

                        if (!$payment) continue;

                        $apply = min($apply, (float) $payment->unused_amount);
                        if ($apply <= 0.005) continue;

                        $existing = PaymentApplication::where('payment_id', $payment->id)
                            ->where('invoice_id', $invoice->id)->first();

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
                    } else {
                        continue;
                    }

                    $remaining    -= $apply;
                    $totalApplied += $apply;
                }

                if ($totalApplied <= 0.005) {
                    return $this->errorResponse('No credits could be applied. Please verify the selected amounts.', 422);
                }

                $invoice->recalculatePayments();
                $invoice->refresh();

                $newStatus = $invoice->status;
                if ($oldStatus !== $newStatus) {
                    app(StockMovementService::class)->onStatusChange(
                        $invoice, $oldStatus, $newStatus, $userId
                    );
                }

                Cache::forget("invoice:detail:{$invoice->id}");

                return $this->successResponse([
                    'message' => 'Credits applied successfully.',
                    'data'    => $invoice->fresh(self::detailWith()),
                    'applied' => round($totalApplied, 2),
                ]);
            });
        } catch (Throwable $e) {
            Log::error('[InvoiceController::applyAvailableCredits] Failed', [
                'invoice_id' => $invoice->id,
                'error'      => $e->getMessage(),
            ]);
            return $this->errorResponse('Failed to apply credits. Please try again.', 500);
        }
    }

    /**
     * DELETE /api/invoices/{invoice}/credit-applications
     * Removes all credit applications for this invoice and recalculates balances.
     */
    public function removeCreditApplications(Request $request, Invoice $invoice): JsonResponse
    {
        try {
            return DB::transaction(function () use ($request, $invoice) {
                $userId    = $request->user()?->id;
                $oldStatus = $invoice->status;

                // Collect affected CustomerCredit IDs before deleting
                $creditIds = \App\Models\CreditApplication::where('invoice_id', $invoice->id)
                    ->pluck('customer_credit_id')
                    ->unique();

                // Collect affected Payment IDs for excess payments before deleting
                $paymentIds = \App\Models\PaymentApplication::where('invoice_id', $invoice->id)
                    ->pluck('payment_id')
                    ->unique();

                // Delete all credit applications (credit-note-sourced)
                \App\Models\CreditApplication::where('invoice_id', $invoice->id)->delete();

                // Delete all payment applications (excess-payment-sourced) tied to credits
                // Only remove PaymentApplications for excess payments (not regular payment allocations)
                // We check payment_mode to avoid removing normal payment-to-invoice links
                $excessPaymentIds = Payment::whereIn('id', $paymentIds)
                    ->where('payment_mode', '!=', 'advance_payment')
                    ->pluck('id');

                \App\Models\PaymentApplication::where('invoice_id', $invoice->id)
                    ->whereIn('payment_id', $excessPaymentIds)
                    ->delete();

                // Recalculate unused_amount on each affected CustomerCredit
                foreach ($creditIds as $creditId) {
                    $credit = \App\Models\CustomerCredit::find($creditId);
                    if ($credit) $credit->recalculateUnused();
                }

                // Recalculate unused_amount on each affected Payment
                foreach ($excessPaymentIds as $paymentId) {
                    $payment = Payment::find($paymentId);
                    if ($payment) $payment->recalculateUnused();
                }

                $invoice->recalculatePayments();
                $invoice->refresh();

                $newStatus = $invoice->status;
                if ($oldStatus !== $newStatus) {
                    app(StockMovementService::class)->onStatusChange($invoice, $oldStatus, $newStatus, $userId);
                }

                Cache::forget("invoice:detail:{$invoice->id}");

                return $this->successResponse([
                    'message' => 'Credit applications removed.',
                    'data'    => $invoice->fresh(self::detailWith()),
                ]);
            });
        } catch (Throwable $e) {
            Log::error('[InvoiceController::removeCreditApplications] Failed', [
                'invoice_id' => $invoice->id,
                'error'      => $e->getMessage(),
            ]);
            return $this->errorResponse('Failed to remove credit applications.', 500);
        }
    }

    // ── Invoice number uniqueness check ───────────────────────────────────────

    /**
     * GET /api/invoices/check-number?invoice_number=INV-000001
     * Returns { available: true } or { available: false }.
     */
    public function checkNumber(Request $request): JsonResponse
    {
        $number = trim((string) $request->query('invoice_number', ''));
        if ($number === '') {
            return $this->errorResponse('invoice_number query parameter is required.', 422);
        }
        $exists = Invoice::withTrashed()->where('invoice_number', $number)->exists();
        return $this->successResponse(['available' => !$exists]);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function nextPaymentNumber(): string
    {
        $max = Payment::withTrashed()->lockForUpdate()->max('id') ?? 0;
        return 'PMT-' . str_pad($max + 1, 6, '0', STR_PAD_LEFT);
    }
}
