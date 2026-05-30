<?php

namespace App\Services;

use App\Models\CustomerActivityLog;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;

/**
 * Writes entries to customer_activity_logs.
 *
 * All methods are silent — failures are logged but never propagate,
 * so a logging error never breaks the main business operation.
 */
class ActivityLogger
{
    // ── Invoice events ────────────────────────────────────────────────────────

    public static function invoiceCreated(Invoice $invoice, ?int $userId): void
    {
        static::write([
            'customer_id'  => $invoice->customer_id,
            'event_type'   => 'invoice_created',
            'subject_type' => 'invoice',
            'subject_id'   => $invoice->id,
            'amount'       => $invoice->grand_total,
            'metadata'     => [
                'invoice_number' => $invoice->invoice_number,
                'invoice_date'   => $invoice->invoice_date?->toDateString(),
                'due_date'       => $invoice->due_date?->toDateString(),
                'grand_total'    => (float) $invoice->grand_total,
                'status'         => $invoice->status,
            ],
            'performed_by' => $userId,
        ]);
    }

    /**
     * @param array $oldData    Snapshot of invoice scalar fields before update
     *                          Keys: invoice_date, due_date, grand_total, status
     * @param array $oldItems   Old line items (each: item_name, quantity, unit_price, amount)
     * @param array|null $newItems  New line items from the request (null = items not touched)
     */
    public static function invoiceUpdated(
        Invoice $invoice,
        ?int    $userId,
        array   $oldData  = [],
        array   $oldItems = [],
        ?array  $newItems = null
    ): void {
        $metadata = [
            'invoice_number' => $invoice->invoice_number,
            'grand_total'    => (float) $invoice->grand_total,
            'status'         => $invoice->status,
        ];

        // Scalar field diff
        $fieldChanges = [];
        $fieldMap = ['invoice_date' => 'Invoice Date', 'due_date' => 'Due Date'];
        foreach ($fieldMap as $key => $label) {
            $oldVal = $oldData[$key] ?? null;
            $newVal = $invoice->{$key}?->toDateString();
            if ($oldVal !== $newVal) {
                $fieldChanges[] = ['field' => $label, 'from' => $oldVal, 'to' => $newVal];
            }
        }
        if (isset($oldData['grand_total']) && abs((float) $oldData['grand_total'] - (float) $invoice->grand_total) > 0.001) {
            $fieldChanges[] = [
                'field' => 'Amount',
                'from'  => (float) $oldData['grand_total'],
                'to'    => (float) $invoice->grand_total,
            ];
        }
        if ($fieldChanges) {
            $metadata['field_changes'] = $fieldChanges;
        }

        // Items diff
        if ($newItems !== null) {
            $diff = static::diffItems($oldItems, $newItems);
            if ($diff['added'] || $diff['removed'] || $diff['changed']) {
                $metadata['items_diff'] = $diff;
            }
        }

        static::write([
            'customer_id'  => $invoice->customer_id,
            'event_type'   => 'invoice_updated',
            'subject_type' => 'invoice',
            'subject_id'   => $invoice->id,
            'amount'       => $invoice->grand_total,
            'metadata'     => $metadata,
            'performed_by' => $userId,
        ]);
    }

    public static function invoiceVoided(Invoice $invoice, ?int $userId): void
    {
        static::write([
            'customer_id'  => $invoice->customer_id,
            'event_type'   => 'invoice_voided',
            'subject_type' => 'invoice',
            'subject_id'   => $invoice->id,
            'amount'       => $invoice->grand_total,
            'metadata'     => [
                'invoice_number' => $invoice->invoice_number,
            ],
            'performed_by' => $userId,
        ]);
    }

    // ── Items diff helper ─────────────────────────────────────────────────────

    /**
     * Compare old and new line item arrays and return an added/removed/changed diff.
     * Items are keyed by item_name (the denormalised snapshot field).
     */
    private static function diffItems(array $old, array $new): array
    {
        $oldByName = [];
        foreach ($old as $it) {
            $name = (string) ($it['item_name'] ?? 'Unknown');
            $oldByName[$name] = $it;
        }

        $added   = [];
        $removed = [];
        $changed = [];
        $seen    = [];

        foreach ($new as $it) {
            $name        = (string) ($it['item_name'] ?? 'Unknown');
            $seen[$name] = true;

            if (!isset($oldByName[$name])) {
                $added[] = [
                    'name' => $name,
                    'qty'  => (float) ($it['quantity']   ?? 1),
                    'rate' => (float) ($it['unit_price']  ?? 0),
                ];
            } else {
                $oldIt   = $oldByName[$name];
                $changes = [];

                if (abs((float) ($it['quantity']   ?? 0) - (float) ($oldIt['quantity']   ?? 0)) > 0.0001) {
                    $changes['qty'] = ['from' => (float) $oldIt['quantity'],   'to' => (float) $it['quantity']];
                }
                if (abs((float) ($it['unit_price'] ?? 0) - (float) ($oldIt['unit_price'] ?? 0)) > 0.001) {
                    $changes['price'] = ['from' => (float) $oldIt['unit_price'], 'to' => (float) $it['unit_price']];
                }
                if ($changes) {
                    $changed[] = ['name' => $name, 'changes' => $changes];
                }
            }
        }

        foreach ($oldByName as $name => $it) {
            if (!isset($seen[$name])) {
                $removed[] = ['name' => $name, 'qty' => (float) ($it['quantity'] ?? 1)];
            }
        }

        return compact('added', 'removed', 'changed');
    }

    public static function invoiceStatusChanged(Invoice $invoice, ?int $userId): void
    {
        $eventType = match ($invoice->status) {
            'paid'            => 'invoice_paid',
            'partially_paid'  => 'invoice_partially_paid',
            'sent'            => 'invoice_sent',
            'voided'          => 'invoice_voided',
            default           => null,
        };

        if (!$eventType) return;

        static::write([
            'customer_id'  => $invoice->customer_id,
            'event_type'   => $eventType,
            'subject_type' => 'invoice',
            'subject_id'   => $invoice->id,
            'amount'       => $invoice->grand_total,
            'metadata'     => [
                'invoice_number'  => $invoice->invoice_number,
                'grand_total'     => (float) $invoice->grand_total,
                'total_paid'      => (float) $invoice->total_paid,
                'balance_amount'  => (float) $invoice->balance_amount,
            ],
            'performed_by' => $userId,
        ]);
    }

    // ── Payment events ────────────────────────────────────────────────────────

    public static function paymentReceived(Payment $payment, ?int $userId): void
    {
        static::write([
            'customer_id'  => $payment->customer_id,
            'event_type'   => 'payment_received',
            'subject_type' => 'payment',
            'subject_id'   => $payment->id,
            'amount'       => $payment->amount,
            'metadata'     => [
                'payment_number'   => $payment->payment_number,
                'payment_mode'     => $payment->payment_mode,
                'payment_date'     => $payment->payment_date?->toDateString(),
                'amount'           => (float) $payment->amount,
                'unused_amount'    => (float) $payment->unused_amount,
                'reference_number' => $payment->reference_number,
            ],
            'performed_by' => $userId,
        ]);
    }

    public static function paymentDeleted(Payment $payment, ?int $userId): void
    {
        static::write([
            'customer_id'  => $payment->customer_id,
            'event_type'   => 'payment_deleted',
            'subject_type' => 'payment',
            'subject_id'   => $payment->id,
            'amount'       => $payment->amount,
            'metadata'     => [
                'payment_number' => $payment->payment_number,
                'payment_mode'   => $payment->payment_mode,
                'amount'         => (float) $payment->amount,
            ],
            'performed_by' => $userId,
        ]);
    }

    // ── Cross-entity events ───────────────────────────────────────────────────

    public static function paymentApplied(
        Payment $payment,
        Invoice $invoice,
        float   $appliedAmount,
        ?int    $userId
    ): void {
        static::write([
            'customer_id'  => $payment->customer_id,
            'event_type'   => 'payment_applied',
            'subject_type' => 'payment',
            'subject_id'   => $payment->id,
            'related_type' => 'invoice',
            'related_id'   => $invoice->id,
            'amount'       => $appliedAmount,
            'metadata'     => [
                'payment_number'   => $payment->payment_number,
                'payment_mode'     => $payment->payment_mode,
                'invoice_number'   => $invoice->invoice_number,
                'applied_amount'   => $appliedAmount,
                'invoice_balance'  => (float) $invoice->balance_amount,
            ],
            'performed_by' => $userId,
        ]);
    }

    public static function paymentUnapplied(
        Payment $payment,
        Invoice $invoice,
        ?int    $userId
    ): void {
        static::write([
            'customer_id'  => $payment->customer_id,
            'event_type'   => 'payment_unapplied',
            'subject_type' => 'payment',
            'subject_id'   => $payment->id,
            'related_type' => 'invoice',
            'related_id'   => $invoice->id,
            'amount'       => null,
            'metadata'     => [
                'payment_number' => $payment->payment_number,
                'invoice_number' => $invoice->invoice_number,
            ],
            'performed_by' => $userId,
        ]);
    }

    // ── Internal writer ───────────────────────────────────────────────────────

    private static function write(array $data): void
    {
        try {
            CustomerActivityLog::create($data);
        } catch (\Throwable $e) {
            // Never let a logging failure break the main operation
            Log::error('[ActivityLogger] Failed to write activity log', [
                'error'    => $e->getMessage(),
                'event'    => $data['event_type'] ?? 'unknown',
                'customer' => $data['customer_id'] ?? null,
            ]);
        }
    }
}
