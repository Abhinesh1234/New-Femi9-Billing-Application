<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransferOrderRequest;
use App\Models\AuditLog;
use App\Models\TransferOrder;
use App\Services\TransferOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Throwable;

class TransferOrderController extends Controller
{
    public function __construct(private TransferOrderService $service) {}

    // ── GET /api/transfer-orders/next-number ─────────────────────────────────
    public function nextNumber(): JsonResponse
    {
        $max = TransferOrder::withTrashed()->count();
        return $this->successResponse([
            'data' => ['transfer_number' => 'TRF-' . str_pad($max + 1, 6, '0', STR_PAD_LEFT)],
        ]);
    }

    // ── GET /api/transfer-orders ─────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'TransferOrderController::index');

        try {
            $perPage = max(1, min((int) $request->query('per_page', 50), 500));

            $query = TransferOrder::select([
                    'id', 'transfer_number', 'transfer_date', 'source_location_id',
                    'destination_location_id', 'reason', 'status', 'created_by', 'created_at',
                ])
                ->with([
                    'sourceLocation:id,name',
                    'destinationLocation:id,name',
                    'createdBy:id,name',
                ])
                ->withCount('lines')
                ->when($request->filled('status'), fn($q) => $q->where('status', $request->query('status')))
                ->when($request->filled('search'), fn($q) => $q->where('transfer_number', 'like', '%' . $request->query('search') . '%'))
                ->when($request->boolean('trashed'), fn($q) => $q->onlyTrashed())
                ->orderByDesc('created_at');

            $paginated = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data'    => $paginated->items(),
                'meta'    => [
                    'current_page' => $paginated->currentPage(),
                    'last_page'    => $paginated->lastPage(),
                    'total'        => $paginated->total(),
                    'per_page'     => $paginated->perPage(),
                ],
            ])->header('Cache-Control', 'private, no-cache');

        } catch (Throwable $e) {
            $this->logException('TransferOrderController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch transfer orders.', 500);
        }
    }

    // ── POST /api/transfer-orders ─────────────────────────────────────────────
    public function store(StoreTransferOrderRequest $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'TransferOrderController::store');

        try {
            $order = $this->service->store($request->validated(), $request);
            Log::info('[TransferOrder] Created', array_merge($ctx, ['id' => $order->id]));

            return $this->successResponse([
                'message' => 'Transfer order created.',
                'data'    => $order->load(['lines.item', 'sourceLocation:id,name', 'destinationLocation:id,name']),
            ], 201);

        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        } catch (Throwable $e) {
            $this->logException('TransferOrderController::store', $e, $ctx);
            return $this->errorResponse('Failed to create transfer order.', 500);
        }
    }

    // ── GET /api/transfer-orders/{id} ────────────────────────────────────────
    public function show(Request $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'TransferOrderController::show');

        try {
            $order = TransferOrder::withTrashed()->with([
                    'lines.item:id,name,sku,unit,image',
                    'sourceLocation:id,name,type',
                    'destinationLocation:id,name,type',
                    'createdBy:id,name',
                    'initiatedBy:id,name',
                    'transferredBy:id,name',
                    'cancelledBy:id,name',
                ])
                ->findOrFail($id);

            return $this->successResponse(['data' => $order]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Transfer order not found.', 404);
        } catch (Throwable $e) {
            $this->logException('TransferOrderController::show', $e, $ctx);
            return $this->errorResponse('Failed to fetch transfer order.', 500);
        }
    }

    // ── PUT /api/transfer-orders/{id} ────────────────────────────────────────
    public function update(StoreTransferOrderRequest $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'TransferOrderController::update');

        try {
            $order = TransferOrder::findOrFail($id);
            $order = $this->service->update($order, $request->validated(), $request);
            Log::info('[TransferOrder] Updated', array_merge($ctx, ['id' => $id]));

            return $this->successResponse([
                'message' => 'Transfer order updated.',
                'data'    => $order->load(['lines.item', 'sourceLocation:id,name', 'destinationLocation:id,name']),
            ]);

        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Transfer order not found.', 404);
        } catch (Throwable $e) {
            $this->logException('TransferOrderController::update', $e, $ctx);
            return $this->errorResponse('Failed to update transfer order.', 500);
        }
    }

    // ── DELETE /api/transfer-orders/{id} ─────────────────────────────────────
    public function destroy(Request $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'TransferOrderController::destroy');

        try {
            $order = TransferOrder::with('lines')->findOrFail($id);

            if ($order->isTransferred()) {
                return $this->errorResponse('Completed (transferred) orders cannot be deleted. Cancel them instead.', 422);
            }

            // Release committed stock before deleting an in_transit order
            if ($order->isInTransit()) {
                $this->service->cancel($order, 'Deleted by user', $request);
            }

            $order->delete();
            Log::info('[TransferOrder] Deleted', array_merge($ctx, ['id' => $id]));

            return $this->successResponse(['message' => 'Transfer order deleted.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Transfer order not found.', 404);
        } catch (Throwable $e) {
            $this->logException('TransferOrderController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete transfer order.', 500);
        }
    }

    // ── POST /api/transfer-orders/{id}/initiate ──────────────────────────────
    public function initiate(Request $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'TransferOrderController::initiate');

        try {
            $order = TransferOrder::with('lines')->findOrFail($id);
            $order = $this->service->initiate($order, $request);
            Log::info('[TransferOrder] Initiated', array_merge($ctx, ['id' => $id]));

            try {
                AuditLog::create([
                    'auditable_type' => $order->getTable(),
                    'auditable_id'   => $order->id,
                    'event'          => 'initiated',
                    'user_id'        => $request->user()?->id,
                    'ip_address'     => $request->ip(),
                    'user_agent'     => $request->userAgent(),
                    'old_values'     => ['status' => 'draft'],
                    'new_values'     => ['status' => 'in_transit', 'initiated_at' => $order->initiated_at],
                ]);
            } catch (Throwable $auditErr) {
                Log::error('[Audit] Failed to write initiated event', ['error' => $auditErr->getMessage()]);
            }

            return $this->successResponse([
                'message' => 'Transfer order initiated.',
                'data'    => $order,
            ]);

        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Transfer order not found.', 404);
        } catch (Throwable $e) {
            $this->logException('TransferOrderController::initiate', $e, $ctx);
            return $this->errorResponse('Failed to initiate transfer order.', 500);
        }
    }

    // ── POST /api/transfer-orders/{id}/transfer ──────────────────────────────
    public function transfer(Request $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'TransferOrderController::transfer');

        try {
            $order = TransferOrder::with('lines')->findOrFail($id);
            $order = $this->service->markAsTransferred($order, $request);
            Log::info('[TransferOrder] Transferred', array_merge($ctx, ['id' => $id]));

            try {
                AuditLog::create([
                    'auditable_type' => $order->getTable(),
                    'auditable_id'   => $order->id,
                    'event'          => 'transferred',
                    'user_id'        => $request->user()?->id,
                    'ip_address'     => $request->ip(),
                    'user_agent'     => $request->userAgent(),
                    'old_values'     => ['status' => 'in_transit'],
                    'new_values'     => ['status' => 'transferred', 'transferred_at' => $order->transferred_at],
                ]);
            } catch (Throwable $auditErr) {
                Log::error('[Audit] Failed to write transferred event', ['error' => $auditErr->getMessage()]);
            }

            return $this->successResponse([
                'message' => 'Transfer order marked as transferred. Stock movements applied.',
                'data'    => $order,
            ]);

        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Transfer order not found.', 404);
        } catch (Throwable $e) {
            $this->logException('TransferOrderController::transfer', $e, $ctx);
            return $this->errorResponse('Failed to complete transfer.', 500);
        }
    }

    // ── POST /api/transfer-orders/{id}/cancel ────────────────────────────────
    public function cancel(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => 'nullable|string|max:1000',
        ]);

        $ctx = $this->buildCtx($request, 'TransferOrderController::cancel');

        try {
            $order = TransferOrder::findOrFail($id);
            $prevStatus = $order->status;
            $order = $this->service->cancel($order, $request->input('reason'), $request);
            Log::info('[TransferOrder] Cancelled', array_merge($ctx, ['id' => $id]));

            try {
                AuditLog::create([
                    'auditable_type' => $order->getTable(),
                    'auditable_id'   => $order->id,
                    'event'          => 'cancelled',
                    'user_id'        => $request->user()?->id,
                    'ip_address'     => $request->ip(),
                    'user_agent'     => $request->userAgent(),
                    'old_values'     => ['status' => $prevStatus],
                    'new_values'     => [
                        'status'              => 'cancelled',
                        'cancelled_at'        => $order->cancelled_at,
                        'cancellation_reason' => $order->cancellation_reason,
                    ],
                ]);
            } catch (Throwable $auditErr) {
                Log::error('[Audit] Failed to write cancelled event', ['error' => $auditErr->getMessage()]);
            }

            return $this->successResponse([
                'message' => 'Transfer order cancelled.',
                'data'    => $order,
            ]);

        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Transfer order not found.', 404);
        } catch (Throwable $e) {
            $this->logException('TransferOrderController::cancel', $e, $ctx);
            return $this->errorResponse('Failed to cancel transfer order.', 500);
        }
    }
}
