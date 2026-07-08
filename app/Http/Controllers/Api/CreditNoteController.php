<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\EnforcesPartyScope;
use App\Models\CreditApplication;
use App\Models\CreditNote;
use App\Models\CreditNoteAttachment;
use App\Models\CustomerCredit;
use App\Models\Invoice;
use App\Models\TransactionSeriesModule;
use App\Services\StockMovementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class CreditNoteController extends Controller
{
    use EnforcesPartyScope;

    private static function detailWith(): array
    {
        return [
            'customer:id,display_name,mobile,gst',
            'location:id,name,address,logo_path',
            'tax:id,name,rate',
            'items',
            'attachments',
            'sourceInvoice:id,invoice_number',
            'customerCredit:id,credit_note_id,amount,unused_amount,status',
            'customerCredit.applications:id,customer_credit_id,invoice_id,applied_amount',
            'customerCredit.applications.invoice:id,invoice_number,invoice_date,grand_total,status',
        ];
    }

    // ── GET /api/credit-notes ─────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CreditNoteController::index');
        try {
            $query = CreditNote::with([
                'customer:id,display_name',
                'location:id,name',
                'sourceInvoice:id,invoice_number',
            ])
            ->when($this->isPartyUser(), fn ($q) => $q->whereIn(
                'customer_id',
                \App\Models\Party::where('parent_party_id', $this->partyScopeId())->pluck('id')
            ))
            ->when(!$this->isPartyUser() && $request->filled('customer_id'), fn ($q) => $q->where('customer_id', $request->query('customer_id')))
            ->when($request->query('location_id'), fn ($q, $v) => $q->where('location_id', $v))
            ->when($request->query('search'), fn ($q, $s) =>
                $q->where('credit_note_number', 'like', "%{$s}%")
            )
            ->when($request->boolean('trashed'), fn ($q) => $q->onlyTrashed())
            ->orderByDesc('credit_note_date')
            ->orderByDesc('id');

            $perPage = min((int) ($request->query('per_page', 50)), 200);
            $data = $query->paginate($perPage);

            return $this->successResponse(['data' => $data]);
        } catch (Throwable $e) {
            $this->logException('CreditNoteController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch credit notes.', 500);
        }
    }

    // ── POST /api/credit-notes ────────────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CreditNoteController::store');
        try {
            $validated = $request->validate([
                'credit_note_number' => 'required|string|max:50|unique:credit_notes,credit_note_number',
                'status'             => 'nullable|in:draft,issued',
                'customer_id'        => 'required|integer|exists:parties,id',
                'location_id'        => 'nullable|integer|exists:locations,id',
                'series_id'          => 'nullable|integer|exists:transaction_series,id',
                'source_invoice_id'  => 'nullable|integer|exists:invoices,id',
                'credit_note_date'   => 'required|date',
                'salesperson'        => 'nullable|string|max:100',
                'sub_total'          => 'required|numeric|min:0',
                'discount_type'      => 'required|in:amount,percent',
                'discount_value'     => 'required|numeric|min:0',
                'discount_amount'    => 'required|numeric|min:0',
                'tax_type'           => 'nullable|in:tds,tcs',
                'tax_id'             => 'nullable|integer|exists:taxes,id',
                'tax_rate'           => 'nullable|numeric',
                'tax_amount'         => 'nullable|numeric',
                'charges_json'       => 'nullable|array',
                'charges_json.*.label'  => 'required|string',
                'charges_json.*.amount' => 'required|numeric',
                'total_charges'      => 'required|numeric|min:0',
                'grand_total'        => 'required|numeric|min:0',
                'customer_notes'     => 'nullable|string',
                'terms_conditions'   => 'nullable|string',
                'items'              => 'required|array|min:1',
                'items.*.item_id'    => 'nullable|integer',
                'items.*.item_name'  => 'required|string',
                'items.*.quantity'   => 'required|numeric|min:0',
                'items.*.unit_price' => 'required|numeric|min:0',
                'items.*.base_rate'  => 'required|numeric|min:0',
                'items.*.gst_rate'   => 'nullable|numeric|min:0',
                'items.*.gst_amount' => 'nullable|numeric|min:0',
                'items.*.amount'     => 'required|numeric|min:0',
                'items.*.sort_order' => 'nullable|integer',
            ]);

            $items = $validated['items'];
            unset($validated['items']);

            $this->resolveCustomerId($validated);

            $userId = $request->user()?->id;
            $validated['created_by'] = $userId;
            $validated['updated_by'] = $userId;
            $validated['status']     = $validated['status'] ?? 'issued';

            DB::beginTransaction();

            $creditNote = CreditNote::create($validated);

            foreach ($items as $i => $itemData) {
                $creditNote->items()->create(array_merge($itemData, [
                    'sort_order' => $itemData['sort_order'] ?? $i,
                ]));
            }

            // Increment series current_number for CreditNote module
            if ($creditNote->series_id) {
                $seriesModule = TransactionSeriesModule::where('series_id', $creditNote->series_id)
                    ->lockForUpdate()
                    ->first();
                if ($seriesModule) {
                    $mod = $seriesModule->getModule('CreditNote');
                    if ($mod) {
                        $prefix   = (string) ($mod['prefix'] ?? '');
                        $savedNum = $prefix !== '' && str_starts_with($creditNote->credit_note_number, $prefix)
                            ? (int) substr($creditNote->credit_note_number, strlen($prefix))
                            : (int) ($mod['current_number'] ?? 1);
                        $next = max((int) ($mod['current_number'] ?? 1), $savedNum) + 1;
                        $seriesModule->updateModule('CreditNote', ['current_number' => $next]);
                    }
                }
            }

            // Optionally release credit to customer's unused credit pool
            // Credits are only meaningful for issued credit notes (not drafts)
            if ($request->boolean('release_credit')
                && $creditNote->status === 'issued'
                && (float) $creditNote->grand_total > 0
            ) {
                CustomerCredit::create([
                    'customer_id'    => $creditNote->customer_id,
                    'credit_note_id' => $creditNote->id,
                    'amount'         => $creditNote->grand_total,
                    'unused_amount'  => $creditNote->grand_total,
                    'status'         => 'open',
                    'created_by'     => $userId,
                ]);
            }

            // Move stock: issued credit note returns items to seller, removes from buyer
            app(StockMovementService::class)->onCreditNoteCreated($creditNote, $userId);

            DB::commit();

            // Flush the source invoice detail cache — is_fully_credited may have changed
            if ($creditNote->source_invoice_id) {
                Cache::forget("invoice:detail:{$creditNote->source_invoice_id}");
            }

            Log::info('[CreditNoteController::store] Created', array_merge($ctx, [
                'credit_note_id'     => $creditNote->id,
                'credit_note_number' => $creditNote->credit_note_number,
                'release_credit'     => $request->boolean('release_credit'),
            ]));

            return $this->successResponse(
                ['data' => $creditNote->load(self::detailWith())],
                201
            );
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('CreditNoteController::store', $e, $ctx);
            return $this->errorResponse('Failed to save credit note.', 500);
        }
    }

    // ── GET /api/credit-notes/{creditNote} ────────────────────────────────────
    public function show(Request $request, CreditNote $creditNote): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CreditNoteController::show');
        try {
            $this->assertCustomerOwnership((int) $creditNote->customer_id);
            return $this->successResponse(['data' => $creditNote->load(self::detailWith())]);
        } catch (Throwable $e) {
            $this->logException('CreditNoteController::show', $e, $ctx);
            return $this->errorResponse('Failed to fetch credit note.', 500);
        }
    }

    // ── POST /api/credit-notes/{creditNote}/attachments ───────────────────────
    public function uploadAttachment(Request $request, CreditNote $creditNote): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CreditNoteController::uploadAttachment');
        try {
            $request->validate(['file' => 'required|file|max:10240']);
            $file = $request->file('file');
            $path = $file->store('credit-note-attachments', 'public');

            $attachment = $creditNote->attachments()->create([
                'file_name'   => $file->getClientOriginalName(),
                'file_path'   => $path,
                'mime_type'   => $file->getMimeType(),
                'file_size'   => $file->getSize(),
                'uploaded_by' => $request->user()?->id,
            ]);

            return $this->successResponse(['data' => $attachment], 201);
        } catch (Throwable $e) {
            $this->logException('CreditNoteController::uploadAttachment', $e, $ctx);
            return $this->errorResponse('Failed to upload attachment.', 500);
        }
    }

    // ── DELETE /api/credit-notes/{creditNote} ─────────────────────────────────
    public function destroy(Request $request, CreditNote $creditNote): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CreditNoteController::destroy');
        try {
            $this->assertCustomerOwnership((int) $creditNote->customer_id);
            DB::beginTransaction();

            // Reverse any credit applications released from this credit note
            $customerCredit = $creditNote->customerCredit;
            if ($customerCredit) {
                $affectedInvoiceIds = CreditApplication::where('customer_credit_id', $customerCredit->id)
                    ->pluck('invoice_id')
                    ->unique()
                    ->toArray();

                // Hard-delete junction records, then soft-delete the credit pool entry
                CreditApplication::where('customer_credit_id', $customerCredit->id)->delete();
                $customerCredit->delete();

                // Recalculate each invoice that had credits applied from this note
                foreach ($affectedInvoiceIds as $invoiceId) {
                    $invoice = Invoice::find($invoiceId);
                    if ($invoice) {
                        $invoice->recalculatePayments();
                        Cache::forget("invoice:detail:{$invoiceId}");
                    }
                }
            }

            // Reverse stock movements created when this credit note was issued
            app(StockMovementService::class)->onCreditNoteDeleted($creditNote, $request->user()?->id);

            $creditNote->delete();

            DB::commit();

            Log::info('[CreditNoteController::destroy] Deleted', array_merge($ctx, [
                'credit_note_id'     => $creditNote->id,
                'credit_note_number' => $creditNote->credit_note_number,
            ]));

            return $this->successResponse(['message' => 'Credit note deleted.']);
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('CreditNoteController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete credit note.', 500);
        }
    }

    // ── DELETE /api/credit-notes/{creditNote}/attachments/{attachment} ────────
    public function deleteAttachment(Request $request, CreditNote $creditNote, CreditNoteAttachment $attachment): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CreditNoteController::deleteAttachment');
        try {
            if ($attachment->credit_note_id !== $creditNote->id) {
                return $this->errorResponse('Attachment does not belong to this credit note.', 403);
            }
            Storage::disk('public')->delete($attachment->file_path);
            $attachment->delete();
            return $this->successResponse(['message' => 'Attachment deleted.']);
        } catch (Throwable $e) {
            $this->logException('CreditNoteController::deleteAttachment', $e, $ctx);
            return $this->errorResponse('Failed to delete attachment.', 500);
        }
    }
}
