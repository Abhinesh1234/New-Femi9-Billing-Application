<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Item;
use App\Models\ItemStock;
use App\Models\TransferOrder;
use App\Models\TransferOrderLine;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransferOrderService
{
    public function __construct(private StockMovementService $stock) {}

    // ── Store ─────────────────────────────────────────────────────────────────

    /**
     * Create a new transfer order with its lines. Status: draft.
     */
    public function store(array $data, Request $request): TransferOrder
    {
        return DB::transaction(function () use ($data, $request) {
            $user = $request->user();

            $order = TransferOrder::create([
                'transfer_number'         => $data['transfer_number'],
                'transfer_date'           => $data['transfer_date'],
                'source_location_id'      => $data['source_location_id'],
                'destination_location_id' => $data['destination_location_id'],
                'reason'                  => $data['reason'] ?? null,
                'status'                  => 'draft',
                'created_by'              => $user->id,
                'updated_by'              => $user->id,
            ]);

            $this->syncLines($order, $data['lines']);

            $this->audit($request, 'created', $order->id, null, $order->load('lines')->toArray());

            return $order;
        });
    }

    // ── Update ────────────────────────────────────────────────────────────────

    /**
     * Update header fields and lines. Only allowed while status = draft.
     */
    public function update(TransferOrder $order, array $data, Request $request): TransferOrder
    {
        if (!$order->isEditable()) {
            throw ValidationException::withMessages([
                'status' => 'Only draft transfer orders can be edited.',
            ]);
        }

        return DB::transaction(function () use ($order, $data, $request) {
            $old = $order->load('lines')->toArray();

            $order->update([
                'transfer_date'           => $data['transfer_date'],
                'source_location_id'      => $data['source_location_id'],
                'destination_location_id' => $data['destination_location_id'],
                'reason'                  => $data['reason'] ?? null,
                'updated_by'              => $request->user()->id,
            ]);

            $this->syncLines($order, $data['lines']);

            $this->audit($request, 'updated', $order->id, $old, $order->fresh('lines')->toArray());

            return $order->fresh('lines');
        });
    }

    // ── Initiate ──────────────────────────────────────────────────────────────

    /**
     * Transition draft → in_transit.
     * Snapshots current stock at both locations for every line.
     * No stock movement happens here.
     */
    public function initiate(TransferOrder $order, Request $request): TransferOrder
    {
        if (!$order->canInitiate()) {
            throw ValidationException::withMessages([
                'status' => "Cannot initiate a transfer order with status '{$order->status}'.",
            ]);
        }

        if ($order->lines()->count() === 0) {
            throw ValidationException::withMessages([
                'lines' => 'At least one line item is required before initiating.',
            ]);
        }

        return DB::transaction(function () use ($order, $request) {
            $old = $order->toArray();

            // Validate available_for_sale and commit (reserve) stock at source.
            // This throws ValidationException if any line lacks sufficient stock.
            $this->stock->onTransferInitiated($order, $request->user()->id);

            // Snapshot available_for_sale at both locations for audit trail.
            foreach ($order->lines as $line) {
                $srcStock = ItemStock::where('item_id', $line->item_id)
                    ->where('location_id', $order->source_location_id)
                    ->first();
                $dstStock = ItemStock::where('item_id', $line->item_id)
                    ->where('location_id', $order->destination_location_id)
                    ->first();

                $line->update([
                    'source_qty_snapshot' => $srcStock ? (float) $srcStock->available_for_sale : 0,
                    'dest_qty_snapshot'   => $dstStock ? (float) $dstStock->available_for_sale : 0,
                ]);
            }

            $order->update([
                'status'       => 'in_transit',
                'initiated_at' => Carbon::now(),
                'initiated_by' => $request->user()->id,
                'updated_by'   => $request->user()->id,
            ]);

            $this->audit($request, 'initiated', $order->id, $old, $order->fresh()->toArray());

            return $order->fresh('lines');
        });
    }

    // ── Mark as Transferred ───────────────────────────────────────────────────

    /**
     * Transition in_transit → transferred.
     * Validates live source stock, then runs all stock movements atomically.
     */
    public function markAsTransferred(TransferOrder $order, Request $request): TransferOrder
    {
        if (!$order->canTransfer()) {
            throw ValidationException::withMessages([
                'status' => "Cannot complete a transfer order with status '{$order->status}'.",
            ]);
        }

        return DB::transaction(function () use ($order, $request) {
            $old = $order->toArray();

            // Delegates pre-validation + stock writes to StockMovementService
            $this->stock->onTransferCompleted($order, $request->user()->id);

            $order->update([
                'status'         => 'transferred',
                'transferred_at' => Carbon::now(),
                'transferred_by' => $request->user()->id,
                'updated_by'     => $request->user()->id,
            ]);

            $this->audit($request, 'transferred', $order->id, $old, $order->fresh()->toArray());

            return $order->fresh('lines');
        });
    }

    // ── Cancel ────────────────────────────────────────────────────────────────

    /**
     * Cancel a draft, in_transit, or transferred order.
     * - draft: no stock reversal needed.
     * - in_transit: releases committed stock (transfer_uncommit).
     * - transferred: reverses physical stock movements (transfer_out_reversal / transfer_in_reversal).
     */
    public function cancel(TransferOrder $order, ?string $reason, Request $request): TransferOrder
    {
        if (!$order->canCancel()) {
            throw ValidationException::withMessages([
                'status' => "Cannot cancel a transfer order with status '{$order->status}'.",
            ]);
        }

        return DB::transaction(function () use ($order, $reason, $request) {
            $old = $order->toArray();

            // Reverse stock effects based on current status before cancelling.
            if ($order->isInTransit()) {
                $this->stock->onTransferInitiateCancelled($order, $request->user()->id);
            } elseif ($order->isTransferred()) {
                $this->stock->onTransferCancelled($order, $request->user()->id);
            }

            $order->update([
                'status'              => 'cancelled',
                'cancellation_reason' => $reason,
                'cancelled_at'        => Carbon::now(),
                'cancelled_by'        => $request->user()->id,
                'updated_by'          => $request->user()->id,
            ]);

            $this->audit($request, 'cancelled', $order->id, $old, $order->fresh()->toArray());

            return $order->fresh();
        });
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Replace all lines for an order with the provided array.
     * Validates qty > 0 and that items exist.
     */
    private function syncLines(TransferOrder $order, array $lines): void
    {
        $order->lines()->delete();

        foreach ($lines as $line) {
            $qty = round((float) ($line['qty_to_transfer'] ?? 0), 4);
            if ($qty <= 0 || empty($line['item_id'])) continue;

            TransferOrderLine::create([
                'transfer_order_id' => $order->id,
                'item_id'           => $line['item_id'],
                'qty_to_transfer'   => $qty,
                'description'       => $line['description'] ?? null,
            ]);
        }
    }

    private function audit(Request $request, string $event, int $orderId, ?array $old, ?array $new): void
    {
        try {
            AuditLog::create([
                'auditable_type' => 'transfer_order',
                'auditable_id'   => $orderId,
                'event'          => $event,
                'user_id'        => $request->user()->id,
                'ip_address'     => $request->ip(),
                'user_agent'     => $request->userAgent(),
                'old_values'     => $old,
                'new_values'     => $new,
            ]);
        } catch (\Throwable) {}
    }
}
