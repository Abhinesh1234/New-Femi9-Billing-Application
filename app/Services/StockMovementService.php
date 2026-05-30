<?php

namespace App\Services;

use App\Models\Assembly;
use App\Models\CreditNote;
use App\Models\CreditNoteItem;
use App\Models\InventoryAdjustment;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Item;
use App\Models\ItemStock;
use App\Models\ItemStockLedger;
use App\Models\Location;
use App\Models\TransferOrder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

/**
 * Central service for all stock movements.
 *
 * Every stock change goes through this service — no controller writes
 * to item_stock or item_stock_ledger directly.
 *
 * Ledger entry date rules:
 *   - Initial application  → invoice_date  (business date of the transaction)
 *   - Reversal entries     → today          (the reversal happened today)
 *   - Re-apply after edit  → invoice_date  (restated as of the original date)
 */
class StockMovementService
{
    // ── Public entry points ───────────────────────────────────────────────────

    /**
     * Called when an assembly is saved.
     * Deducts each component from the assembly location, then adds the
     * composite item to the same location. Wrapped in a transaction with
     * pre-validation so stock is never partially modified.
     */
    public function onAssemblyCreated(Assembly $assembly, ?int $userId): void
    {
        DB::transaction(function () use ($assembly, $userId) {
            $locationId      = $assembly->location_id;
            $assembledDate   = Carbon::parse($assembly->assembled_date);
            $assemblyNumber  = $assembly->assembly_number;
            $qtyToAssemble   = (float) $assembly->quantity_to_assemble;

            // 1. Pre-validate: every component must have enough available stock.
            foreach ($assembly->items as $line) {
                $stock = ItemStock::where('item_id', $line->item_id)
                    ->where('location_id', $locationId)
                    ->lockForUpdate()
                    ->first();

                $available = $stock ? (float) $stock->available_for_sale : 0;

                if ($available < (float) $line->total_quantity) {
                    throw ValidationException::withMessages([
                        'stock' => "Insufficient stock for \"{$line->item_name}\". "
                            . "Required: {$line->total_quantity}, Available: {$available}.",
                    ]);
                }
            }

            // 2. Deduct each component.
            foreach ($assembly->items as $line) {
                $this->writeLineAssembly(
                    $line->item_id, $locationId,
                    -(float) $line->total_quantity,
                    'assembly_consumed',
                    $assembly, $assembledDate, $userId,
                    "Assembly {$assemblyNumber} — component consumed",
                    (float) $line->cost_price ?: null
                );
            }

            // 3. Add composite item.
            $compositeItem = Item::find($assembly->composite_item_id);
            $unitValue     = $compositeItem ? (float) $compositeItem->cost_price ?: null : null;

            $this->writeLineAssembly(
                $assembly->composite_item_id, $locationId,
                +$qtyToAssemble,
                'assembly_produced',
                $assembly, $assembledDate, $userId,
                "Assembly {$assemblyNumber} — composite item produced",
                $unitValue
            );
        });
    }

    /**
     * Called when an assembly is cancelled.
     * Reverses all ledger entries written by onAssemblyCreated.
     */
    public function onAssemblyCancelled(Assembly $assembly, ?int $userId): void
    {
        DB::transaction(function () use ($assembly, $userId) {
            $today = Carbon::today();

            $entries = ItemStockLedger::where('reference_type', 'assembly')
                ->where('reference_id', $assembly->id)
                ->get();

            foreach ($entries as $entry) {
                $type = $this->reverseType($entry->transaction_type);
                if (!$type) continue;

                $this->writeLineAssembly(
                    $entry->item_id,
                    $entry->location_id,
                    -(float) $entry->qty_change,
                    $type,
                    $assembly, $today, $userId,
                    "Assembly {$assembly->assembly_number} — cancelled (reversal)",
                    $entry->unit_value !== null ? (float) $entry->unit_value : null
                );
            }
        });
    }

    /**
     * Called when a credit note is created with status = issued.
     *
     * Seller movement depends on the source invoice status:
     *   paid                    → sale_return   (+stock_on_hand, stock physically returns)
     *   sent/partially_paid/overdue → uncommit  (release the committed reservation only)
     *   draft / no invoice      → no seller movement (nothing was committed or sold yet)
     *
     * Buyer movement:
     *   sent/partially_paid/overdue/paid → purchase_return (-stock_on_hand, buyer returns goods)
     *   draft / no invoice              → no buyer movement (buyer never received anything)
     */
    public function onCreditNoteCreated(CreditNote $creditNote, ?int $userId): void
    {
        if ($creditNote->status !== 'issued') return;

        $sellerLocationId = $creditNote->location_id;
        $buyerLocationId  = $this->resolveBuyerLocation($creditNote->customer_id);
        $creditNoteDate   = Carbon::parse($creditNote->credit_note_date);
        $items            = $creditNote->items()->with('item')->get();

        // Resolve source invoice status to determine correct stock movement type
        $srcStatus = null;
        if ($creditNote->source_invoice_id) {
            $srcInvoice = \App\Models\Invoice::withTrashed()->find($creditNote->source_invoice_id);
            $srcStatus  = $srcInvoice?->status;
        }
        // Normalise overdue → sent for stock purposes (overdue is stock-equivalent to sent)
        $normSrcStatus = $srcStatus === 'overdue' ? 'sent' : $srcStatus;

        DB::transaction(function () use ($creditNote, $sellerLocationId, $buyerLocationId, $creditNoteDate, $items, $userId, $normSrcStatus) {
            foreach ($items as $lineItem) {
                if (!$this->shouldTrackCN($lineItem)) continue;
                $qty       = (float) $lineItem->quantity;
                $unitValue = (float) ($lineItem->unit_price ?? 0) ?: null;
                $note      = "Credit Note {$creditNote->credit_note_number}";

                // ── Seller ──────────────────────────────────────────────────
                if ($sellerLocationId) {
                    if ($normSrcStatus === 'paid') {
                        // Stock was already physically deducted on payment → return it now
                        $this->writeLineCN(
                            $lineItem->item_id, $sellerLocationId,
                            +$qty, 0, 'sale_return',
                            $creditNote, $creditNoteDate, $userId,
                            "{$note} — stock returned to seller", $unitValue
                        );
                    } elseif (in_array($normSrcStatus, ['sent', 'partially_paid'])) {
                        // Stock was only committed (reserved), never physically moved → uncommit it
                        $this->writeLineCN(
                            $lineItem->item_id, $sellerLocationId,
                            0, -$qty, 'uncommit',
                            $creditNote, $creditNoteDate, $userId,
                            "{$note} — uncommitted from seller (CN on sent invoice)", $unitValue
                        );
                    }
                    // draft or null source invoice → no stock movement for seller
                }

                // ── Buyer ────────────────────────────────────────────────────
                // Buyer receives stock when invoice goes from draft → sent/paid.
                // Only reverse if the buyer actually has the goods.
                if ($buyerLocationId && in_array($normSrcStatus, ['sent', 'partially_paid', 'paid'])) {
                    $this->writeLineCN(
                        $lineItem->item_id, $buyerLocationId,
                        -$qty, 0, 'purchase_return',
                        $creditNote, $creditNoteDate, $userId,
                        "{$note} — stock returned by buyer", $unitValue
                    );
                }
            }
        });
    }

    /**
     * Called when a credit note is deleted.
     * Reverses all ledger entries created by onCreditNoteCreated.
     */
    public function onCreditNoteDeleted(CreditNote $creditNote, ?int $userId): void
    {
        $sellerLocationId = $creditNote->location_id;
        $buyerLocationId  = $this->resolveBuyerLocation($creditNote->customer_id);
        $today            = Carbon::today();

        DB::transaction(function () use ($creditNote, $sellerLocationId, $buyerLocationId, $today, $userId) {
            $this->reverseCreditNoteLedger($creditNote, $sellerLocationId, $buyerLocationId, $today, $userId);
        });
    }

    /**
     * Called when invoice status changes (from any source).
     * Handles all seller + buyer stock transitions based on old → new status.
     */
    public function onStatusChange(Invoice $invoice, string $oldStatus, string $newStatus, ?int $userId): void
    {
        if ($oldStatus === $newStatus) return;

        $sellerLocationId = $invoice->location_id;
        $buyerLocationId  = $this->resolveBuyerLocation($invoice->customer_id);
        $invoiceDate      = Carbon::parse($invoice->invoice_date);
        $today            = Carbon::today();
        $items            = $invoice->items()->with('item')->get();

        DB::transaction(function () use (
            $invoice, $oldStatus, $newStatus,
            $sellerLocationId, $buyerLocationId,
            $invoiceDate, $today, $items, $userId
        ) {
            // → void: reverse all existing stock movements (like delete)
            if ($newStatus === 'void') {
                $this->reverseInvoiceLedger($invoice, $sellerLocationId, $buyerLocationId, $today, $userId);
                // Also reverse any credit-note stock entries that were written against this invoice,
                // because those entries already moved stock; voiding the invoice must undo them
                // to prevent double-return (Bug: paid invoice void after CN = stock returned twice).
                $this->reverseCreditNotesForInvoice($invoice, $sellerLocationId, $buyerLocationId, $today, $userId);
                return;
            }

            // void → X: re-apply from scratch (like restore from draft)
            if ($oldStatus === 'void') {
                foreach ($items as $lineItem) {
                    if (!$this->shouldTrack($lineItem)) continue;
                    $qty       = (float) $lineItem->quantity;
                    $unitValue = (float) ($lineItem->unit_price ?? 0) ?: null;
                    if ($sellerLocationId) {
                        $this->applySellerTransition('draft', $newStatus, $lineItem->item_id, $sellerLocationId, $qty, $invoice, $invoiceDate, $today, $userId, $unitValue);
                    }
                    if ($buyerLocationId) {
                        $this->applyBuyerTransition('draft', $newStatus, $lineItem->item_id, $buyerLocationId, $qty, $invoice, $invoiceDate, $today, $userId, $unitValue);
                    }
                }
                return;
            }

            foreach ($items as $lineItem) {
                if (!$this->shouldTrack($lineItem)) continue;

                $qty       = (float) $lineItem->quantity;
                $unitValue = (float) ($lineItem->unit_price ?? 0) ?: null;

                // ── Seller transitions ────────────────────────────────────────
                if ($sellerLocationId) {
                    $this->applySellerTransition(
                        $oldStatus, $newStatus,
                        $lineItem->item_id, $sellerLocationId,
                        $qty, $invoice, $invoiceDate, $today, $userId, $unitValue
                    );
                }

                // ── Buyer transitions ─────────────────────────────────────────
                if ($buyerLocationId) {
                    $this->applyBuyerTransition(
                        $oldStatus, $newStatus,
                        $lineItem->item_id, $buyerLocationId,
                        $qty, $invoice, $invoiceDate, $today, $userId, $unitValue
                    );
                }
            }
        });
    }

    /**
     * Called when invoice line items are edited (any status except draft).
     * Fully reverses old item movements, re-applies new ones.
     * Returns stock impact warnings (items that will go negative).
     */
    public function onItemsChanged(Invoice $invoice, array $newItems, ?int $userId): array
    {
        $status           = $invoice->status;
        $sellerLocationId = $invoice->location_id;
        $buyerLocationId  = $this->resolveBuyerLocation($invoice->customer_id);
        $invoiceDate      = Carbon::parse($invoice->invoice_date);
        $today            = Carbon::today();

        // Preview impact before writing — collect warnings
        $warnings = $this->previewImpact($invoice, $newItems);

        DB::transaction(function () use (
            $invoice, $newItems, $status,
            $sellerLocationId, $buyerLocationId,
            $invoiceDate, $today, $userId
        ) {
            // 1. Reverse all existing ledger entries for this invoice
            $this->reverseInvoiceLedger($invoice, $sellerLocationId, $buyerLocationId, $today, $userId);

            if ($status === 'draft') return;

            // 2. Re-apply with new items
            foreach ($newItems as $newItem) {
                if (empty($newItem['item_id'])) continue;
                $item = Item::find($newItem['item_id']);
                if (!$item || !$item->track_inventory) continue;

                $qty       = (float) ($newItem['quantity'] ?? 0);
                if ($qty <= 0) continue;

                $itemId    = (int) $newItem['item_id'];
                $unitValue = (float) ($newItem['unit_price'] ?? 0) ?: null;

                if ($sellerLocationId) {
                    if (in_array($status, ['sent', 'partially_paid', 'overdue'])) {
                        $this->writeLine(
                            $itemId, $sellerLocationId, 0, +$qty, 'commit',
                            $invoice, $invoiceDate, $userId,
                            "Invoice {$invoice->invoice_number} restated", $unitValue
                        );
                    } elseif ($status === 'paid') {
                        $this->writeLine(
                            $itemId, $sellerLocationId, -$qty, 0, 'sale',
                            $invoice, $invoiceDate, $userId,
                            "Invoice {$invoice->invoice_number} restated", $unitValue
                        );
                    }
                }

                if ($buyerLocationId) {
                    if (in_array($status, ['sent', 'partially_paid', 'overdue', 'paid'])) {
                        $this->writeLine(
                            $itemId, $buyerLocationId, $qty, 0, 'purchase',
                            $invoice, $invoiceDate, $userId,
                            "Invoice {$invoice->invoice_number} restated — received", $unitValue
                        );
                    }
                }
            }
        });

        return $warnings;
    }

    /**
     * Called when invoice is soft-deleted.
     */
    public function onDeleted(Invoice $invoice, ?int $userId): void
    {
        $status           = $invoice->status;
        $sellerLocationId = $invoice->location_id;
        $buyerLocationId  = $this->resolveBuyerLocation($invoice->customer_id);
        $today            = Carbon::today();

        if ($status === 'draft') return;

        DB::transaction(function () use ($invoice, $status, $sellerLocationId, $buyerLocationId, $today, $userId) {
            $this->reverseInvoiceLedger($invoice, $sellerLocationId, $buyerLocationId, $today, $userId);
            $this->reverseCreditNotesForInvoice($invoice, $sellerLocationId, $buyerLocationId, $today, $userId);
        });
    }

    /**
     * Called when invoice is restored from trash.
     */
    public function onRestored(Invoice $invoice, ?int $userId): void
    {
        $status           = $invoice->status;
        $sellerLocationId = $invoice->location_id;
        $buyerLocationId  = $this->resolveBuyerLocation($invoice->customer_id);
        $invoiceDate      = Carbon::parse($invoice->invoice_date);
        $today            = Carbon::today();

        if ($status === 'draft') return;

        DB::transaction(function () use ($invoice, $status, $sellerLocationId, $buyerLocationId, $invoiceDate, $today, $userId) {
            $items = $invoice->items()->with('item')->get();
            foreach ($items as $lineItem) {
                if (!$this->shouldTrack($lineItem)) continue;
                $qty       = (float) $lineItem->quantity;
                $unitValue = (float) ($lineItem->unit_price ?? 0) ?: null;

                if ($sellerLocationId) {
                    $this->applySellerTransition('draft', $status, $lineItem->item_id, $sellerLocationId, $qty, $invoice, $invoiceDate, $today, $userId, $unitValue);
                }
                if ($buyerLocationId) {
                    $this->applyBuyerTransition('draft', $status, $lineItem->item_id, $buyerLocationId, $qty, $invoice, $invoiceDate, $today, $userId, $unitValue);
                }
            }
        });
    }

    /**
     * Preview what stock changes would happen if newItems are applied.
     * Returns array of warnings (items that would go negative).
     * Does NOT write to the database.
     */
    public function previewImpact(Invoice $invoice, array $newItems): array
    {
        $status           = $invoice->status;
        $sellerLocationId = $invoice->location_id;
        $buyerLocationId  = $this->resolveBuyerLocation($invoice->customer_id);
        $warnings         = [];

        if ($status === 'draft') return [];

        // Build map of current stock for all affected items+locations
        $affectedPairs = [];

        // Existing items (will be reversed)
        $existingItems = $invoice->items()->get();
        foreach ($existingItems as $li) {
            if (!$li->item_id) continue;
            if ($sellerLocationId) $affectedPairs[] = [$li->item_id, $sellerLocationId];
            if ($buyerLocationId)  $affectedPairs[] = [$li->item_id, $buyerLocationId];
        }
        // New items (will be applied)
        foreach ($newItems as $ni) {
            if (empty($ni['item_id'])) continue;
            if ($sellerLocationId) $affectedPairs[] = [$ni['item_id'], $sellerLocationId];
            if ($buyerLocationId)  $affectedPairs[] = [$ni['item_id'], $buyerLocationId];
        }

        if (empty($affectedPairs)) return [];

        // Load current stock snapshots (no locking — this is read-only preview)
        $stockMap = [];
        foreach ($affectedPairs as [$itemId, $locationId]) {
            $key = "{$itemId}_{$locationId}";
            if (isset($stockMap[$key])) continue;
            $row = ItemStock::where('item_id', $itemId)->where('location_id', $locationId)->first();
            $stockMap[$key] = [
                'stock_on_hand'      => $row ? (float) $row->stock_on_hand      : 0,
                'committed_stock'    => $row ? (float) $row->committed_stock     : 0,
                'available_for_sale' => $row ? (float) $row->available_for_sale : 0,
            ];
        }

        // Simulate reversal of existing items
        foreach ($existingItems as $li) {
            if (!$li->item_id) continue;
            $item = Item::find($li->item_id);
            if (!$item || !$item->track_inventory) continue;
            $qty = (float) $li->quantity;

            if ($sellerLocationId) {
                $key = "{$li->item_id}_{$sellerLocationId}";
                if (in_array($status, ['sent', 'partially_paid', 'overdue'])) {
                    $stockMap[$key]['committed_stock']    -= $qty;
                    $stockMap[$key]['available_for_sale'] += $qty;
                } elseif ($status === 'paid') {
                    $stockMap[$key]['stock_on_hand']      += $qty;
                    $stockMap[$key]['available_for_sale'] += $qty;
                }
            }
            if ($buyerLocationId) {
                $key = "{$li->item_id}_{$buyerLocationId}";
                if (in_array($status, ['sent', 'partially_paid', 'overdue', 'paid'])) {
                    $stockMap[$key]['stock_on_hand']      -= $qty;
                    $stockMap[$key]['available_for_sale'] -= $qty;
                }
            }
        }

        // Simulate applying new items
        foreach ($newItems as $ni) {
            if (empty($ni['item_id'])) continue;
            $item = Item::find($ni['item_id']);
            if (!$item || !$item->track_inventory) continue;
            $qty = (float) ($ni['quantity'] ?? 0);
            if ($qty <= 0) continue;

            if ($sellerLocationId) {
                $key = "{$ni['item_id']}_{$sellerLocationId}";
                if (!isset($stockMap[$key])) $stockMap[$key] = ['stock_on_hand' => 0, 'committed_stock' => 0, 'available_for_sale' => 0];
                if (in_array($status, ['sent', 'partially_paid', 'overdue'])) {
                    $stockMap[$key]['committed_stock']    += $qty;
                    $stockMap[$key]['available_for_sale'] -= $qty;
                } elseif ($status === 'paid') {
                    $stockMap[$key]['stock_on_hand']      -= $qty;
                    $stockMap[$key]['available_for_sale'] -= $qty;
                }
            }
            if ($buyerLocationId) {
                $key = "{$ni['item_id']}_{$buyerLocationId}";
                if (!isset($stockMap[$key])) $stockMap[$key] = ['stock_on_hand' => 0, 'committed_stock' => 0, 'available_for_sale' => 0];
                if (in_array($status, ['sent', 'partially_paid', 'overdue', 'paid'])) {
                    $stockMap[$key]['stock_on_hand']      += $qty;
                    $stockMap[$key]['available_for_sale'] += $qty;
                }
            }
        }

        // Collect warnings for any negative results
        foreach ($stockMap as $key => $snap) {
            [$itemId, $locationId] = explode('_', $key, 2);
            $item     = Item::find($itemId);
            $location = Location::find($locationId);
            if (!$item || !$location) continue;

            if ($snap['available_for_sale'] < 0 || $snap['stock_on_hand'] < 0) {
                $warnings[] = [
                    'item_id'              => (int) $itemId,
                    'item_name'            => $item->name ?? "Item #{$itemId}",
                    'location_id'          => (int) $locationId,
                    'location_name'        => $location->name,
                    'available_for_sale'   => round($snap['available_for_sale'], 4),
                    'stock_on_hand'        => round($snap['stock_on_hand'], 4),
                    'committed_stock'      => round($snap['committed_stock'], 4),
                    'is_seller'            => (int) $locationId === (int) $sellerLocationId,
                    'is_buyer'             => (int) $locationId === (int) $buyerLocationId,
                ];
            }
        }

        return $warnings;
    }

    // ── Transfer Orders ───────────────────────────────────────────────────────

    /**
     * Called when a transfer order is initiated (draft → in_transit).
     * Validates available_for_sale at source and commits (reserves) the stock.
     * stock_on_hand is NOT changed — only committed_stock increases.
     */
    public function onTransferInitiated(TransferOrder $order, ?int $userId): void
    {
        DB::transaction(function () use ($order, $userId) {
            $srcId        = $order->source_location_id;
            $transferDate = Carbon::parse($order->transfer_date);
            $ref          = $order->transfer_number;

            // 1. Pre-validate: every tracked line must have sufficient available_for_sale.
            foreach ($order->lines as $line) {
                $item = Item::find($line->item_id);
                if (!$item || !$item->track_inventory) continue;

                $stock = ItemStock::where('item_id', $line->item_id)
                    ->where('location_id', $srcId)
                    ->lockForUpdate()
                    ->first();

                $available = $stock ? (float) $stock->available_for_sale : 0;

                if ($available < (float) $line->qty_to_transfer) {
                    throw ValidationException::withMessages([
                        'stock' => "Insufficient available stock for \"{$item->name}\". "
                            . "Required: {$line->qty_to_transfer}, Available at source: {$available}.",
                    ]);
                }
            }

            // 2. Commit (reserve) stock for each tracked line at source.
            foreach ($order->lines as $line) {
                $item = Item::find($line->item_id);
                if (!$item || !$item->track_inventory) continue;

                $qty = (float) $line->qty_to_transfer;

                $this->writeLineTransfer(
                    $line->item_id, $srcId,
                    0,     // stock_on_hand unchanged
                    +$qty, // committed_stock increases — stock is reserved
                    'transfer_commit',
                    $order, $transferDate, $userId,
                    "Transfer {$ref} — stock committed at source"
                );
            }
        });
    }

    /**
     * Called when an in_transit order is cancelled.
     * Reverses transfer_commit entries by writing transfer_uncommit to release reserved stock.
     */
    public function onTransferInitiateCancelled(TransferOrder $order, ?int $userId): void
    {
        DB::transaction(function () use ($order, $userId) {
            $today   = Carbon::today();
            $entries = ItemStockLedger::where('reference_type', 'transfer_order')
                ->where('reference_id', $order->id)
                ->where('transaction_type', 'transfer_commit')
                ->get();

            foreach ($entries as $entry) {
                $this->writeLineTransfer(
                    $entry->item_id,
                    $entry->location_id,
                    0,                               // stock_on_hand unchanged
                    -(float) $entry->committed_change, // release the committed reservation
                    'transfer_uncommit',
                    $order, $today, $userId,
                    "Transfer {$order->transfer_number} — commitment released (cancelled)"
                );
            }
        });
    }

    /**
     * Called when a transfer order is marked as transferred (in_transit → transferred).
     * Validates stock_on_hand as a safety check, then physically moves stock.
     * transfer_out: reduces stock_on_hand AND committed_stock (releases the commit).
     * transfer_in:  increases stock_on_hand at destination only.
     */
    public function onTransferCompleted(TransferOrder $order, ?int $userId): void
    {
        DB::transaction(function () use ($order, $userId) {
            $srcId         = $order->source_location_id;
            $dstId         = $order->destination_location_id;
            $transferDate  = Carbon::parse($order->transfer_date);
            $ref           = $order->transfer_number;

            // 1. Safety check: stock_on_hand must cover the transfer qty.
            foreach ($order->lines as $line) {
                $item = Item::find($line->item_id);
                if (!$item || !$item->track_inventory) continue;

                $stock = ItemStock::where('item_id', $line->item_id)
                    ->where('location_id', $srcId)
                    ->lockForUpdate()
                    ->first();

                $onHand = $stock ? (float) $stock->stock_on_hand : 0;

                if ($onHand < (float) $line->qty_to_transfer) {
                    throw ValidationException::withMessages([
                        'stock' => "Insufficient stock for \"{$item->name}\". "
                            . "Required: {$line->qty_to_transfer}, On hand at source: {$onHand}.",
                    ]);
                }
            }

            // 2. Write physical stock movements for each tracked line.
            foreach ($order->lines as $line) {
                $item = Item::find($line->item_id);
                if (!$item || !$item->track_inventory) continue;

                $qty = (float) $line->qty_to_transfer;

                // Source: physical deduction + release the earlier commitment
                $this->writeLineTransfer(
                    $line->item_id, $srcId,
                    -$qty, // stock_on_hand decreases
                    -$qty, // committed_stock decreases (commitment released as stock leaves)
                    'transfer_out',
                    $order, $transferDate, $userId,
                    "Transfer {$ref} — stock out from source"
                );

                // Destination: physical addition only (no commitment at destination)
                $this->writeLineTransfer(
                    $line->item_id, $dstId,
                    +$qty, // stock_on_hand increases
                    0,     // committed_stock unchanged at destination
                    'transfer_in',
                    $order, $transferDate, $userId,
                    "Transfer {$ref} — stock in to destination"
                );
            }
        });
    }

    /**
     * Called when a completed (transferred) order is cancelled by admin.
     * Only reverses transfer_out and transfer_in entries using distinct reversal types.
     * Does NOT touch transfer_commit/transfer_uncommit entries.
     */
    public function onTransferCancelled(TransferOrder $order, ?int $userId): void
    {
        DB::transaction(function () use ($order, $userId) {
            $today   = Carbon::today();
            $entries = ItemStockLedger::where('reference_type', 'transfer_order')
                ->where('reference_id', $order->id)
                ->whereIn('transaction_type', ['transfer_out', 'transfer_in'])
                ->get();

            foreach ($entries as $entry) {
                $type = $entry->transaction_type === 'transfer_out'
                    ? 'transfer_out_reversal'
                    : 'transfer_in_reversal';

                $this->writeLineTransfer(
                    $entry->item_id,
                    $entry->location_id,
                    -(float) $entry->qty_change,
                    0, // committed_stock is already net-zero after a completed transfer
                    $type,
                    $order, $today, $userId,
                    "Transfer {$order->transfer_number} — reversed (cancelled after transfer)"
                );
            }
        });
    }

    // ── Inventory Adjustment ──────────────────────────────────────────────────

    /**
     * Called when a committed inventory adjustment is saved.
     * Writes adjustment_in / adjustment_out entries for each line that has a non-zero delta.
     * Only items with track_inventory=true are moved.
     */
    public function onAdjustmentCreated(InventoryAdjustment $adjustment, ?int $userId): void
    {
        if ($adjustment->status !== 'committed') return;

        DB::transaction(function () use ($adjustment, $userId) {
            $locationId     = $adjustment->location_id;
            $adjustmentDate = Carbon::parse($adjustment->adjustment_date);

            foreach ($adjustment->items as $line) {
                if (!$line->item_id) continue;

                $item = Item::find($line->item_id);
                if (!$item || !$item->track_inventory) continue;

                $delta = round((float) $line->qty_adjusted, 4);
                if ($delta == 0) continue;

                $type  = $delta > 0 ? 'adjustment_in' : 'adjustment_out';
                $notes = "Adjustment #{$adjustment->id}" .
                    ($adjustment->reference_number ? " ({$adjustment->reference_number})" : '') .
                    " — {$adjustment->reason_name}";

                $this->writeLineAdjustment(
                    $line->item_id, $locationId,
                    $delta, $type,
                    $adjustment, $adjustmentDate, $userId,
                    $notes,
                    (float) $line->cost_price ?: null
                );
            }
        });
    }

    /**
     * Called when an adjustment is soft-deleted.
     * Reverses all ledger entries written by onAdjustmentCreated.
     */
    public function onAdjustmentDeleted(InventoryAdjustment $adjustment, ?int $userId): void
    {
        DB::transaction(function () use ($adjustment, $userId) {
            $today   = Carbon::today();
            $entries = ItemStockLedger::where('reference_type', 'inventory_adjustment')
                ->where('reference_id', $adjustment->id)
                ->get();

            foreach ($entries as $entry) {
                $type = $this->reverseType($entry->transaction_type);
                if (!$type) continue;

                $this->writeLineAdjustment(
                    $entry->item_id,
                    $entry->location_id,
                    -(float) $entry->qty_change,
                    $type,
                    $adjustment, $today, $userId,
                    "Adjustment #{$adjustment->id} — reversal (deleted)",
                    $entry->unit_value !== null ? (float) $entry->unit_value : null
                );
            }
        });
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function applySellerTransition(
        string $oldStatus, string $newStatus,
        int $itemId, int $locationId, float $qty,
        Invoice $invoice, Carbon $invoiceDate, Carbon $today, ?int $userId,
        ?float $unitValue = null
    ): void {
        // overdue is stock-equivalent to sent — normalize so all comparisons below hold
        $oldStatus = $oldStatus === 'overdue' ? 'sent' : $oldStatus;
        $newStatus = $newStatus === 'overdue' ? 'sent' : $newStatus;
        if ($oldStatus === $newStatus) return;

        $note = "Invoice {$invoice->invoice_number}";

        // draft → sent/partially_paid : commit (reserve stock; committed_stock increases)
        if ($oldStatus === 'draft' && in_array($newStatus, ['sent', 'partially_paid'])) {
            $this->writeLine($itemId, $locationId, 0, +$qty, 'commit', $invoice, $invoiceDate, $userId, "{$note} confirmed", $unitValue);
        }
        // draft → paid : stock leaves immediately (no commit phase)
        elseif ($oldStatus === 'draft' && $newStatus === 'paid') {
            $this->writeLine($itemId, $locationId, -$qty, 0, 'sale', $invoice, $invoiceDate, $userId, "{$note} confirmed & paid", $unitValue);
        }
        // sent/partially_paid → paid : release commit then deduct stock
        elseif (in_array($oldStatus, ['sent', 'partially_paid']) && $newStatus === 'paid') {
            $this->writeLine($itemId, $locationId, 0, -$qty, 'uncommit', $invoice, $today, $userId, "{$note} fully paid — uncommit", $unitValue);
            $this->writeLine($itemId, $locationId, -$qty, 0, 'sale',     $invoice, $today, $userId, "{$note} fully paid — stock out", $unitValue);
        }
        // paid → sent/partially_paid : return stock + re-commit (payment deleted)
        elseif ($oldStatus === 'paid' && in_array($newStatus, ['sent', 'partially_paid'])) {
            $this->writeLine($itemId, $locationId, $qty,  0,    'sale_return', $invoice, $today, $userId, "{$note} payment reversed — stock returned", $unitValue);
            $this->writeLine($itemId, $locationId, 0,    +$qty, 'commit',      $invoice, $today, $userId, "{$note} payment reversed — re-committed", $unitValue);
        }
        // sent → draft : release commit
        elseif (in_array($oldStatus, ['sent', 'partially_paid']) && $newStatus === 'draft') {
            $this->writeLine($itemId, $locationId, 0, -$qty, 'uncommit', $invoice, $today, $userId, "{$note} reverted to draft", $unitValue);
        }
    }

    private function applyBuyerTransition(
        string $oldStatus, string $newStatus,
        int $itemId, int $locationId, float $qty,
        Invoice $invoice, Carbon $invoiceDate, Carbon $today, ?int $userId,
        ?float $unitValue = null
    ): void {
        // overdue is stock-equivalent to sent — normalize so all comparisons below hold
        $oldStatus = $oldStatus === 'overdue' ? 'sent' : $oldStatus;
        $newStatus = $newStatus === 'overdue' ? 'sent' : $newStatus;
        if ($oldStatus === $newStatus) return;

        $note = "Invoice {$invoice->invoice_number}";

        // draft → sent/partially_paid/paid : buyer receives stock
        if ($oldStatus === 'draft' && in_array($newStatus, ['sent', 'partially_paid', 'paid'])) {
            $this->writeLine($itemId, $locationId, $qty, 0, 'purchase', $invoice, $invoiceDate, $userId, "{$note} — received by buyer", $unitValue);
        }
        // sent/partially_paid → draft : buyer returns stock
        elseif (in_array($oldStatus, ['sent', 'partially_paid']) && $newStatus === 'draft') {
            $this->writeLine($itemId, $locationId, -$qty, 0, 'purchase_return', $invoice, $today, $userId, "{$note} reverted to draft — buyer stock reversed", $unitValue);
        }
        // paid → sent/partially_paid : buyer keeps their stock (no action)
        // sent → paid : buyer already has stock (no action)
    }

    /**
     * Reverse all ledger entries for this invoice (for both seller and buyer).
     * Writes equal-and-opposite entries dated today.
     */
    private function reverseInvoiceLedger(
        Invoice $invoice,
        ?int $sellerLocationId,
        ?int $buyerLocationId,
        Carbon $today,
        ?int $userId
    ): void {
        $entries = ItemStockLedger::where('reference_type', 'invoice')
            ->where('reference_id', $invoice->id)
            ->get();

        foreach ($entries as $entry) {
            $type = $this->reverseType($entry->transaction_type);
            if (!$type) continue;

            // Only reverse entries that belong to the seller or buyer location
            if ($entry->location_id != $sellerLocationId && $entry->location_id != $buyerLocationId) continue;

            $this->writeLine(
                $entry->item_id,
                $entry->location_id,
                -(float) $entry->qty_change,
                -(float) $entry->committed_change,
                $type,
                $invoice,
                $today,
                $userId,
                "Invoice {$invoice->invoice_number} — reversal",
                $entry->unit_value !== null ? (float) $entry->unit_value : null
            );
        }
    }

    /**
     * Write one ledger entry and atomically update item_stock snapshot.
     * Uses lockForUpdate to prevent concurrent race conditions.
     */
    private function writeLine(
        int $itemId,
        int $locationId,
        float $qtyChange,
        float $committedChange,
        string $transactionType,
        Invoice $invoice,
        Carbon $transactionDate,
        ?int $userId,
        string $notes = '',
        ?float $unitValue = null
    ): void {
        $stock = ItemStock::lockForUpdate()
            ->firstOrCreate(
                ['item_id' => $itemId, 'location_id' => $locationId],
                ['stock_on_hand' => 0, 'committed_stock' => 0, 'available_for_sale' => 0]
            );

        $newOnHand    = round((float) $stock->stock_on_hand    + $qtyChange,        4);
        $newCommitted = round((float) $stock->committed_stock  + $committedChange,  4);
        $newAvailable = round($newOnHand - $newCommitted, 4);

        $stock->stock_on_hand      = $newOnHand;
        $stock->committed_stock    = $newCommitted;
        $stock->available_for_sale = $newAvailable;
        $stock->save();
        $this->checkReorder($itemId, $locationId, $newAvailable);

        ItemStockLedger::create([
            'item_id'             => $itemId,
            'location_id'         => $locationId,
            'transaction_type'    => $transactionType,
            'transaction_date'    => $transactionDate->toDateString(),
            'reference_type'      => 'invoice',
            'reference_id'        => $invoice->id,
            'qty_change'          => $qtyChange,
            'committed_change'    => $committedChange,
            'unit_value'          => $unitValue,
            'stock_on_hand_after' => $newOnHand,
            'committed_after'     => $newCommitted,
            'available_after'     => $newAvailable,
            'notes'               => $notes,
            'created_by'          => $userId,
        ]);
    }

    /** Resolve the buyer's stock location from their party record. */
    private function resolveBuyerLocation(int $customerId): ?int
    {
        $location = Location::where('party_id', $customerId)
            ->where('is_active', true)
            ->value('id');

        return $location ? (int) $location : null;
    }

    /** Check if a line item should have stock tracked. */
    private function shouldTrack(InvoiceItem $lineItem): bool
    {
        if (!$lineItem->item_id) return false;
        if (!$lineItem->item) return false;
        return (bool) $lineItem->item->track_inventory;
    }

    /** Map a transaction type to its reversal type. */
    private function reverseType(string $type): ?string
    {
        return match ($type) {
            'sale'                => 'sale_return',
            'purchase'            => 'purchase_return',
            'commit'              => 'uncommit',
            'uncommit'            => 'commit',
            'sale_return'         => 'sale',
            'purchase_return'     => 'purchase',
            'assembly_consumed'   => 'assembly_produced',
            'assembly_produced'   => 'assembly_consumed',
            'adjustment_in'       => 'adjustment_out',
            'adjustment_out'      => 'adjustment_in',
            'transfer_commit'        => 'transfer_uncommit',
            'transfer_uncommit'     => 'transfer_commit',
            'transfer_out'          => 'transfer_out_reversal',
            'transfer_in'           => 'transfer_in_reversal',
            'transfer_out_reversal' => 'transfer_out',
            'transfer_in_reversal'  => 'transfer_in',
            default               => null,
        };
    }

    /** Write one ledger entry for an assembly and update the item_stock snapshot. */
    private function writeLineAssembly(
        int $itemId,
        int $locationId,
        float $qtyChange,
        string $transactionType,
        Assembly $assembly,
        Carbon $transactionDate,
        ?int $userId,
        string $notes = '',
        ?float $unitValue = null
    ): void {
        $stock = ItemStock::lockForUpdate()
            ->firstOrCreate(
                ['item_id' => $itemId, 'location_id' => $locationId],
                ['stock_on_hand' => 0, 'committed_stock' => 0, 'available_for_sale' => 0]
            );

        $newOnHand    = round((float) $stock->stock_on_hand   + $qtyChange, 4);
        $newCommitted = round((float) $stock->committed_stock,              4);
        $newAvailable = round($newOnHand - $newCommitted,                   4);

        $stock->stock_on_hand      = $newOnHand;
        $stock->available_for_sale = $newAvailable;
        $stock->save();
        $this->checkReorder($itemId, $locationId, $newAvailable);

        ItemStockLedger::create([
            'item_id'             => $itemId,
            'location_id'         => $locationId,
            'transaction_type'    => $transactionType,
            'transaction_date'    => $transactionDate->toDateString(),
            'reference_type'      => 'assembly',
            'reference_id'        => $assembly->id,
            'qty_change'          => $qtyChange,
            'committed_change'    => 0,
            'unit_value'          => $unitValue,
            'stock_on_hand_after' => $newOnHand,
            'committed_after'     => $newCommitted,
            'available_after'     => $newAvailable,
            'notes'               => $notes,
            'created_by'          => $userId,
        ]);
    }

    /** Reverse all ledger entries for this credit note. */
    private function reverseCreditNoteLedger(
        CreditNote $creditNote,
        ?int $sellerLocationId,
        ?int $buyerLocationId,
        Carbon $today,
        ?int $userId
    ): void {
        $entries = ItemStockLedger::where('reference_type', 'credit_note')
            ->where('reference_id', $creditNote->id)
            ->get();

        foreach ($entries as $entry) {
            $type = $this->reverseType($entry->transaction_type);
            if (!$type) continue;

            if ($entry->location_id != $sellerLocationId && $entry->location_id != $buyerLocationId) continue;

            $this->writeLineCN(
                $entry->item_id,
                $entry->location_id,
                -(float) $entry->qty_change,
                -(float) $entry->committed_change,
                $type,
                $creditNote,
                $today,
                $userId,
                "Credit Note {$creditNote->credit_note_number} — reversal",
                $entry->unit_value !== null ? (float) $entry->unit_value : null
            );
        }
    }

    /**
     * When an invoice is voided/deleted, reverse all credit-note ledger entries that were
     * written against credit notes sourced from this invoice.
     *
     * IMPORTANT: reversals are stored under reference_type='credit_note' (via writeLineCN),
     * NOT under the invoice. This keeps the ledger self-consistent:
     *   - If the CN is later deleted, reverseCreditNoteLedger finds both the original entry
     *     AND this void-reversal, and they cancel each other → net zero, which is correct.
     *   - If the CN is never deleted, the void-reversal alone neutralises the CN's stock
     *     impact, which is also correct.
     */
    private function reverseCreditNotesForInvoice(
        Invoice $invoice,
        ?int $sellerLocationId,
        ?int $buyerLocationId,
        Carbon $today,
        ?int $userId
    ): void {
        $creditNotes = CreditNote::where('source_invoice_id', $invoice->id)
            ->where('status', 'issued')
            ->get()
            ->keyBy('id');

        if ($creditNotes->isEmpty()) return;

        $entries = ItemStockLedger::where('reference_type', 'credit_note')
            ->whereIn('reference_id', $creditNotes->keys())
            ->get();

        foreach ($entries as $entry) {
            $type = $this->reverseType($entry->transaction_type);
            if (!$type) continue;

            if ($entry->location_id != $sellerLocationId && $entry->location_id != $buyerLocationId) continue;

            $creditNote = $creditNotes->get($entry->reference_id);
            if (!$creditNote) continue;

            // Store reversal under the credit_note reference (not invoice) so that
            // a subsequent CN deletion correctly nets to zero instead of triple-reversing.
            $this->writeLineCN(
                $entry->item_id,
                $entry->location_id,
                -(float) $entry->qty_change,
                -(float) $entry->committed_change,
                $type,
                $creditNote,
                $today,
                $userId,
                "Invoice {$invoice->invoice_number} voided — CN stock entry reversed",
                $entry->unit_value !== null ? (float) $entry->unit_value : null
            );
        }
    }

    /** Write one ledger entry for a credit note and update the item_stock snapshot. */
    private function writeLineCN(
        int $itemId,
        int $locationId,
        float $qtyChange,
        float $committedChange,
        string $transactionType,
        CreditNote $creditNote,
        Carbon $transactionDate,
        ?int $userId,
        string $notes = '',
        ?float $unitValue = null
    ): void {
        $stock = ItemStock::lockForUpdate()
            ->firstOrCreate(
                ['item_id' => $itemId, 'location_id' => $locationId],
                ['stock_on_hand' => 0, 'committed_stock' => 0, 'available_for_sale' => 0]
            );

        $newOnHand    = round((float) $stock->stock_on_hand   + $qtyChange,      4);
        $newCommitted = round((float) $stock->committed_stock + $committedChange, 4);
        $newAvailable = round($newOnHand - $newCommitted, 4);

        $stock->stock_on_hand      = $newOnHand;
        $stock->committed_stock    = $newCommitted;
        $stock->available_for_sale = $newAvailable;
        $stock->save();
        $this->checkReorder($itemId, $locationId, $newAvailable);

        ItemStockLedger::create([
            'item_id'             => $itemId,
            'location_id'         => $locationId,
            'transaction_type'    => $transactionType,
            'transaction_date'    => $transactionDate->toDateString(),
            'reference_type'      => 'credit_note',
            'reference_id'        => $creditNote->id,
            'qty_change'          => $qtyChange,
            'committed_change'    => $committedChange,
            'unit_value'          => $unitValue,
            'stock_on_hand_after' => $newOnHand,
            'committed_after'     => $newCommitted,
            'available_after'     => $newAvailable,
            'notes'               => $notes,
            'created_by'          => $userId,
        ]);
    }

    /** Write one ledger entry for a transfer order and update the item_stock snapshot. */
    private function writeLineTransfer(
        int $itemId,
        int $locationId,
        float $qtyChange,
        float $committedChange,
        string $transactionType,
        TransferOrder $order,
        Carbon $transactionDate,
        ?int $userId,
        string $notes = ''
    ): void {
        $stock = ItemStock::lockForUpdate()
            ->firstOrCreate(
                ['item_id' => $itemId, 'location_id' => $locationId],
                ['stock_on_hand' => 0, 'committed_stock' => 0, 'available_for_sale' => 0]
            );

        $newOnHand    = round((float) $stock->stock_on_hand   + $qtyChange,      4);
        $newCommitted = round((float) $stock->committed_stock + $committedChange, 4);
        $newAvailable = round($newOnHand - $newCommitted,                         4);

        $stock->stock_on_hand      = $newOnHand;
        $stock->committed_stock    = $newCommitted;
        $stock->available_for_sale = $newAvailable;
        $stock->save();
        $this->checkReorder($itemId, $locationId, $newAvailable);

        ItemStockLedger::create([
            'item_id'             => $itemId,
            'location_id'         => $locationId,
            'transaction_type'    => $transactionType,
            'transaction_date'    => $transactionDate->toDateString(),
            'reference_type'      => 'transfer_order',
            'reference_id'        => $order->id,
            'qty_change'          => $qtyChange,
            'committed_change'    => $committedChange,
            'unit_value'          => null,
            'stock_on_hand_after' => $newOnHand,
            'committed_after'     => $newCommitted,
            'available_after'     => $newAvailable,
            'notes'               => $notes,
            'created_by'          => $userId,
        ]);
    }

    /** Check if a credit note line item should have stock tracked. */
    private function shouldTrackCN(CreditNoteItem $lineItem): bool
    {
        if (!$lineItem->item_id) return false;
        if (!$lineItem->item)    return false;
        return (bool) $lineItem->item->track_inventory;
    }

    /** Write one ledger entry for an inventory adjustment and update the item_stock snapshot. */
    private function writeLineAdjustment(
        int $itemId,
        int $locationId,
        float $qtyChange,
        string $transactionType,
        InventoryAdjustment $adjustment,
        Carbon $transactionDate,
        ?int $userId,
        string $notes = '',
        ?float $unitValue = null
    ): void {
        $stock = ItemStock::lockForUpdate()
            ->firstOrCreate(
                ['item_id' => $itemId, 'location_id' => $locationId],
                ['stock_on_hand' => 0, 'committed_stock' => 0, 'available_for_sale' => 0]
            );

        $newOnHand    = round((float) $stock->stock_on_hand   + $qtyChange, 4);
        $newCommitted = round((float) $stock->committed_stock,              4);
        $newAvailable = round($newOnHand - $newCommitted,                   4);

        $stock->stock_on_hand      = $newOnHand;
        $stock->available_for_sale = $newAvailable;
        $stock->save();
        $this->checkReorder($itemId, $locationId, $newAvailable);

        ItemStockLedger::create([
            'item_id'             => $itemId,
            'location_id'         => $locationId,
            'transaction_type'    => $transactionType,
            'transaction_date'    => $transactionDate->toDateString(),
            'reference_type'      => 'inventory_adjustment',
            'reference_id'        => $adjustment->id,
            'qty_change'          => $qtyChange,
            'committed_change'    => 0,
            'unit_value'          => $unitValue,
            'stock_on_hand_after' => $newOnHand,
            'committed_after'     => $newCommitted,
            'available_after'     => $newAvailable,
            'notes'               => $notes,
            'created_by'          => $userId,
        ]);
    }

    /** Fire a reorder alert for party-owned locations when available stock drops to/below reorder point. */
    private function checkReorder(int $itemId, int $locationId, float $newAvailable): void
    {
        try {
            app(ReorderNotificationService::class)->checkAndNotify($itemId, $locationId, $newAvailable);
        } catch (\Throwable $e) {
            Log::error('[StockMovement] checkReorder failed', ['error' => $e->getMessage()]);
        }
    }
}
