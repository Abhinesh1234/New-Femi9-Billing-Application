<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\InventoryAdjustment;
use App\Models\InventoryAdjustmentAttachment;
use App\Services\StockMovementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class InventoryAdjustmentController extends Controller
{
    private static function listWith(): array
    {
        return ['location:id,name', 'party:id,display_name', 'createdBy:id,name'];
    }

    private static function detailWith(): array
    {
        return ['location:id,name', 'party:id,display_name', 'reason:id,name', 'items', 'attachments', 'createdBy:id,name'];
    }

    // ── GET /api/inventory/adjustments ────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'InventoryAdjustmentController::index');
        try {
            $query = InventoryAdjustment::select([
                    'id', 'reference_number', 'adjustment_date', 'reason_id', 'reason_name',
                    'location_id', 'party_id', 'description', 'status', 'created_by', 'created_at',
                ])
                ->with(self::listWith())
                ->withCount('items')
                ->when($request->filled('location_id'),   fn ($q) => $q->where('location_id',  $request->query('location_id')))
                ->when($request->filled('party_id'),      fn ($q) => $q->where('party_id',     $request->query('party_id')))
                ->when($request->filled('status'),        fn ($q) => $q->where('status',       $request->query('status')))
                ->when($request->filled('from_date'),     fn ($q) => $q->whereDate('adjustment_date', '>=', $request->query('from_date')))
                ->when($request->filled('to_date'),       fn ($q) => $q->whereDate('adjustment_date', '<=', $request->query('to_date')))
                ->when($request->filled('search'),        fn ($q) => $q->where(fn ($s) =>
                    $s->where('reference_number', 'like', "%{$request->query('search')}%")
                      ->orWhere('reason_name',    'like', "%{$request->query('search')}%")
                ))
                ->when($request->boolean('trashed'),      fn ($q) => $q->onlyTrashed())
                ->orderByDesc('adjustment_date')
                ->orderByDesc('id');

            $perPage = min((int) ($request->query('per_page', 50)), 200);
            return $this->successResponse(['data' => $query->paginate($perPage)]);
        } catch (Throwable $e) {
            $this->logException('InventoryAdjustmentController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch adjustments.', 500);
        }
    }

    // ── POST /api/inventory/adjustments ──────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'InventoryAdjustmentController::store');
        try {
            $validated = $request->validate([
                'reference_number'  => 'nullable|string|max:100',
                'adjustment_date'   => 'required|date',
                'reason_id'         => 'nullable|integer|exists:inventory_adjustment_reasons,id',
                'reason_name'       => 'required|string|max:255',
                'location_id'       => 'required|integer|exists:locations,id',
                'party_id'          => 'nullable|integer|exists:parties,id',
                'description'       => 'nullable|string|max:500',
                'status'            => 'nullable|in:draft,committed',
                'items'             => 'required|array|min:1',
                'items.*.item_id'         => 'nullable|integer|exists:items,id',
                'items.*.item_name'       => 'required|string|max:255',
                'items.*.item_sku'        => 'nullable|string|max:100',
                'items.*.item_unit'       => 'nullable|string|max:50',
                'items.*.cost_price'      => 'nullable|numeric|min:0',
                'items.*.qty_available'   => 'nullable|numeric',
                'items.*.new_qty_on_hand' => 'required|numeric',
                'items.*.qty_adjusted'    => 'required|numeric',
                'items.*.sort_order'      => 'nullable|integer',
            ]);

            $userId = $request->user()?->id;
            $items  = $validated['items'];
            unset($validated['items']);

            $validated['status']     = $validated['status'] ?? 'committed';
            $validated['created_by'] = $userId;
            $validated['updated_by'] = $userId;

            DB::beginTransaction();

            $adjustment = InventoryAdjustment::create($validated);

            foreach ($items as $i => $itemData) {
                $adjustment->items()->create([
                    'item_id'         => $itemData['item_id'] ?? null,
                    'item_name'       => $itemData['item_name'],
                    'item_sku'        => $itemData['item_sku'] ?? null,
                    'item_unit'       => $itemData['item_unit'] ?? null,
                    'cost_price'      => $itemData['cost_price'] ?? 0,
                    'qty_available'   => $itemData['qty_available'] ?? null,
                    'new_qty_on_hand' => $itemData['new_qty_on_hand'],
                    'qty_adjusted'    => $itemData['qty_adjusted'],
                    'sort_order'      => $itemData['sort_order'] ?? $i,
                ]);
            }

            // Apply stock movements for committed adjustments
            app(StockMovementService::class)->onAdjustmentCreated($adjustment, $userId);

            DB::commit();

            // Domain-specific audit event for committed adjustments
            if ($adjustment->status === 'committed') {
                try {
                    AuditLog::create([
                        'auditable_type' => $adjustment->getTable(),
                        'auditable_id'   => $adjustment->id,
                        'event'          => 'committed',
                        'user_id'        => $userId,
                        'ip_address'     => $request->ip(),
                        'user_agent'     => $request->userAgent(),
                        'old_values'     => null,
                        'new_values'     => ['status' => 'committed', 'items_count' => count($items)],
                    ]);
                } catch (Throwable $auditErr) {
                    Log::error('[Audit] Failed to write committed event', ['error' => $auditErr->getMessage()]);
                }
            }

            Log::info('[InventoryAdjustmentController::store] Created', array_merge($ctx, [
                'adjustment_id' => $adjustment->id,
                'status'        => $adjustment->status,
                'items_count'   => count($items),
            ]));

            return $this->successResponse(
                ['data' => $adjustment->load(self::detailWith())],
                201
            );
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('InventoryAdjustmentController::store', $e, $ctx);
            return $this->errorResponse('Failed to save adjustment.', 500);
        }
    }

    // ── GET /api/inventory/adjustments/{adjustment} ───────────────────────────
    public function show(Request $request, InventoryAdjustment $adjustment): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'InventoryAdjustmentController::show');
        try {
            return $this->successResponse(['data' => $adjustment->load(self::detailWith())]);
        } catch (Throwable $e) {
            $this->logException('InventoryAdjustmentController::show', $e, $ctx);
            return $this->errorResponse('Failed to fetch adjustment.', 500);
        }
    }

    // ── DELETE /api/inventory/adjustments/{adjustment} ────────────────────────
    public function destroy(Request $request, InventoryAdjustment $adjustment): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'InventoryAdjustmentController::destroy');
        try {
            DB::beginTransaction();

            // Reverse stock movements before deleting
            app(StockMovementService::class)->onAdjustmentDeleted($adjustment, $request->user()?->id);

            $adjustment->delete();

            DB::commit();

            Log::info('[InventoryAdjustmentController::destroy] Deleted', array_merge($ctx, [
                'adjustment_id' => $adjustment->id,
            ]));

            return $this->successResponse(['message' => 'Adjustment deleted.']);
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('InventoryAdjustmentController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete adjustment.', 500);
        }
    }

    // ── POST /api/inventory/adjustments/{adjustment}/attachments ──────────────
    public function uploadAttachment(Request $request, InventoryAdjustment $adjustment): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'InventoryAdjustmentController::uploadAttachment');
        try {
            $request->validate(['file' => 'required|file|max:10240']);
            $file = $request->file('file');
            $path = $file->store('inventory-adjustment-attachments', 'public');

            $attachment = $adjustment->attachments()->create([
                'file_name'   => $file->getClientOriginalName(),
                'file_path'   => $path,
                'mime_type'   => $file->getMimeType(),
                'file_size'   => $file->getSize(),
                'uploaded_by' => $request->user()?->id,
            ]);

            return $this->successResponse(['data' => $attachment], 201);
        } catch (Throwable $e) {
            $this->logException('InventoryAdjustmentController::uploadAttachment', $e, $ctx);
            return $this->errorResponse('Failed to upload attachment.', 500);
        }
    }

    // ── DELETE /api/inventory/adjustments/{adjustment}/attachments/{attachment}
    public function deleteAttachment(
        Request $request,
        InventoryAdjustment $adjustment,
        InventoryAdjustmentAttachment $attachment
    ): JsonResponse {
        $ctx = $this->buildCtx($request, 'InventoryAdjustmentController::deleteAttachment');
        try {
            if ($attachment->adjustment_id !== $adjustment->id) {
                return $this->errorResponse('Attachment does not belong to this adjustment.', 403);
            }
            Storage::disk('public')->delete($attachment->file_path);
            $attachment->delete();
            return $this->successResponse(['message' => 'Attachment deleted.']);
        } catch (Throwable $e) {
            $this->logException('InventoryAdjustmentController::deleteAttachment', $e, $ctx);
            return $this->errorResponse('Failed to delete attachment.', 500);
        }
    }
}
