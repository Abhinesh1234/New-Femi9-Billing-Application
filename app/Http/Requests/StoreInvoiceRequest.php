<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    protected function prepareForValidation(): void
    {
        $clean = [];

        foreach (['order_number', 'salesperson', 'customer_notes', 'terms_conditions'] as $field) {
            if ($this->has($field) && $this->input($field) !== null) {
                $clean[$field] = strip_tags((string) $this->input($field));
            }
        }

        if ($this->has('charges_json') && is_array($this->input('charges_json'))) {
            $clean['charges_json'] = array_map(function ($charge) {
                if (isset($charge['label'])) {
                    $charge['label'] = strip_tags((string) $charge['label']);
                }
                return $charge;
            }, $this->input('charges_json'));
        }

        if ($this->has('items') && is_array($this->input('items'))) {
            $clean['items'] = array_map(function ($item) {
                if (isset($item['item_name'])) {
                    $item['item_name'] = strip_tags((string) $item['item_name']);
                }
                return $item;
            }, $this->input('items'));
        }

        if (!empty($clean)) {
            $this->merge($clean);
        }
    }

    public function rules(): array
    {
        return [
            // ── Identity ──────────────────────────────────────────────────────
            'invoice_number'   => ['required', 'string', 'max:50', 'unique:invoices,invoice_number'],
            'status'           => ['sometimes', 'in:draft,sent'],

            // ── Relations ─────────────────────────────────────────────────────
            'customer_id'  => ['required', 'integer', 'exists:parties,id'],
            'location_id'  => ['nullable', 'integer', 'exists:locations,id'],
            'series_id'    => ['nullable', 'integer', 'exists:transaction_series,id'],
            'reference_id' => ['nullable', 'integer', 'exists:invoice_references,id'],
            'pricelist_id' => ['nullable', 'integer', 'exists:price_lists,id'],

            // ── Header ────────────────────────────────────────────────────────
            'order_number'  => ['nullable', 'string', 'max:100'],
            'invoice_date'  => ['required', 'date'],
            'payment_terms' => ['required', 'in:due_on_receipt,net_15,net_30,net_45,net_60,net_90,custom'],
            'due_date'      => ['nullable', 'date'],
            'salesperson'   => ['nullable', 'string', 'max:100'],

            // ── Pricing ───────────────────────────────────────────────────────
            'sub_total'       => ['required', 'numeric', 'min:0'],
            'discount_type'   => ['required', 'in:amount,percent'],
            'discount_value'  => ['required', 'numeric', 'min:0'],
            'discount_amount' => ['required', 'numeric', 'min:0'],
            'tax_type'        => ['nullable', 'in:tds,tcs'],
            'tax_id'          => ['nullable', 'integer', 'exists:taxes,id'],
            'tax_rate'        => ['nullable', 'numeric', 'min:0'],
            'tax_amount'      => ['required', 'numeric'],
            'charges_json'    => ['nullable', 'array'],
            'charges_json.*.label'  => ['required', 'string', 'max:100'],
            'charges_json.*.amount' => ['required', 'numeric', 'min:0'],
            'total_charges'   => ['required', 'numeric', 'min:0'],
            'grand_total'     => ['required', 'numeric', 'min:0'],

            // ── Notes ─────────────────────────────────────────────────────────
            'customer_notes'   => ['nullable', 'string', 'max:5000'],
            'terms_conditions' => ['nullable', 'string', 'max:5000'],

            // ── Line items ────────────────────────────────────────────────────
            'items'                  => ['required', 'array', 'min:1'],
            'items.*.item_id'        => ['nullable', 'integer', 'exists:items,id'],
            'items.*.item_name'      => ['required', 'string', 'max:255'],
            'items.*.pricelist_id'   => ['nullable', 'integer', 'exists:price_lists,id'],
            'items.*.quantity'       => ['required', 'numeric', 'min:0.0001'],
            'items.*.unit_price'     => ['required', 'numeric', 'min:0'],
            'items.*.base_rate'      => ['required', 'numeric', 'min:0'],
            'items.*.gst_rate'       => ['required', 'numeric', 'min:0'],
            'items.*.gst_amount'     => ['required', 'numeric', 'min:0'],
            'items.*.amount'         => ['required', 'numeric', 'min:0'],
            'items.*.sort_order'     => ['nullable', 'integer', 'min:0'],

            // ── Payments ──────────────────────────────────────────────────────
            'payments'                    => ['nullable', 'array'],
            'payments.*.payment_mode'     => ['required_with:payments', 'in:cash,cheque,bank_transfer,credit_card,upi,advance_payment'],
            'payments.*.amount'           => ['required_with:payments', 'numeric', 'min:0.01'],
            'payments.*.reference_number' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            // due_date must not be before invoice_date
            if (
                $this->filled('due_date') && $this->filled('invoice_date') &&
                $this->input('due_date') < $this->input('invoice_date')
            ) {
                $v->errors()->add('due_date', 'Due date cannot be earlier than the invoice date.');
            }

            // Total payments must not exceed grand_total
            $payments    = $this->input('payments') ?? [];
            $grandTotal  = (float) $this->input('grand_total', 0);
            $paymentsSum = collect($payments)->sum(fn ($p) => (float) ($p['amount'] ?? 0));

            if ($paymentsSum > $grandTotal + 0.01) {
                $v->errors()->add('payments', 'Total payment amount cannot exceed the invoice grand total.');
            }

            // Stock check: block if any tracked-inventory item has insufficient stock
            $locationId = (int) $this->input('location_id', 0);
            $itemsInput = $this->input('items', []);

            if ($locationId > 0 && !empty($itemsInput)) {
                $itemIds = collect($itemsInput)
                    ->filter(fn ($i) => !empty($i['item_id']))
                    ->pluck('item_id')
                    ->map(fn ($id) => (int) $id)
                    ->unique()
                    ->values()
                    ->toArray();

                if (!empty($itemIds)) {
                    $trackedItems = \App\Models\Item::whereIn('id', $itemIds)
                        ->where('track_inventory', true)
                        ->pluck('name', 'id');

                    if ($trackedItems->isNotEmpty()) {
                        $stocks = \App\Models\ItemStock::whereIn('item_id', $trackedItems->keys())
                            ->where('location_id', $locationId)
                            ->pluck('available_for_sale', 'item_id');

                        $quantities = collect($itemsInput)
                            ->filter(fn ($i) => !empty($i['item_id']) && $trackedItems->has((int) $i['item_id']))
                            ->groupBy(fn ($i) => (int) $i['item_id'])
                            ->map(fn ($rows) => collect($rows)->sum(fn ($r) => (float) ($r['quantity'] ?? 0)));

                        foreach ($quantities as $itemId => $qty) {
                            $available = (float) ($stocks[$itemId] ?? 0);
                            if ($qty > $available) {
                                $name = $trackedItems[$itemId] ?? "Item #{$itemId}";
                                $v->errors()->add(
                                    'items',
                                    "Insufficient stock for \"{$name}\": requested {$qty}, available for sale {$available}."
                                );
                            }
                        }
                    }
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            // Identity
            'invoice_number.required' => 'Invoice number is required.',
            'invoice_number.unique'   => 'This invoice number is already in use.',
            'invoice_number.max'      => 'Invoice number must not exceed 50 characters.',

            // Relations
            'customer_id.required' => 'Please select a customer.',
            'customer_id.exists'   => 'The selected customer does not exist.',
            'location_id.exists'   => 'The selected location does not exist.',
            'series_id.exists'     => 'The selected series does not exist.',
            'pricelist_id.exists'  => 'The selected price list does not exist.',

            // Header
            'invoice_date.required' => 'Invoice date is required.',
            'invoice_date.date'     => 'Invoice date must be a valid date.',
            'payment_terms.required' => 'Payment terms are required.',
            'payment_terms.in'       => 'Invalid payment terms selected.',
            'due_date.date'          => 'Due date must be a valid date.',

            // Pricing
            'sub_total.required'       => 'Sub total is required.',
            'sub_total.numeric'        => 'Sub total must be a number.',
            'discount_type.required'   => 'Discount type is required.',
            'discount_value.required'  => 'Discount value is required.',
            'discount_amount.required' => 'Discount amount is required.',
            'grand_total.required'     => 'Grand total is required.',
            'grand_total.min'          => 'Grand total cannot be negative.',

            // Line items
            'items.required'               => 'At least one line item is required.',
            'items.min'                    => 'At least one line item is required.',
            'items.*.item_name.required'   => 'Item name is required for each line item.',
            'items.*.item_name.max'        => 'Item name must not exceed 255 characters.',
            'items.*.quantity.required'    => 'Quantity is required for each line item.',
            'items.*.quantity.min'         => 'Quantity must be greater than zero.',
            'items.*.unit_price.required'  => 'Unit price is required for each line item.',
            'items.*.unit_price.min'       => 'Unit price cannot be negative.',
            'items.*.amount.required'      => 'Amount is required for each line item.',

            // Payments
            'payments.*.payment_mode.required_with' => 'Payment mode is required for each payment.',
            'payments.*.payment_mode.in'            => 'Invalid payment mode selected.',
            'payments.*.amount.required_with'       => 'Amount is required for each payment.',
            'payments.*.amount.min'                 => 'Payment amount must be greater than zero.',
        ];
    }
}
