<?php

namespace App\Http\Requests;

use App\Models\Invoice;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateInvoiceRequest extends FormRequest
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
        $invoiceId = $this->route('invoice');

        return [
            'invoice_number'   => ['sometimes', 'string', 'max:50', Rule::unique('invoices', 'invoice_number')->ignore($invoiceId)],
            'status'           => ['sometimes', 'in:draft,sent,paid,partially_paid,overdue,void'],

            'customer_id'  => ['sometimes', 'integer', 'exists:parties,id'],
            'location_id'  => ['nullable', 'integer', 'exists:locations,id'],
            'series_id'    => ['nullable', 'integer', 'exists:transaction_series,id'],
            'reference_id' => ['nullable', 'integer', 'exists:invoice_references,id'],
            'pricelist_id' => ['nullable', 'integer', 'exists:price_lists,id'],

            'order_number'  => ['nullable', 'string', 'max:100'],
            'invoice_date'  => ['sometimes', 'date'],
            'payment_terms' => ['sometimes', 'in:due_on_receipt,net_15,net_30,net_45,net_60,net_90,custom'],
            'due_date'      => ['nullable', 'date'],
            'salesperson'   => ['nullable', 'string', 'max:100'],

            'sub_total'       => ['sometimes', 'numeric', 'min:0'],
            'discount_type'   => ['sometimes', 'in:amount,percent'],
            'discount_value'  => ['sometimes', 'numeric', 'min:0'],
            'discount_amount' => ['sometimes', 'numeric', 'min:0'],
            'tax_type'        => ['nullable', 'in:tds,tcs'],
            'tax_id'          => ['nullable', 'integer', 'exists:taxes,id'],
            'tax_rate'        => ['nullable', 'numeric', 'min:0'],
            'tax_amount'      => ['sometimes', 'numeric'],
            'charges_json'    => ['nullable', 'array'],
            'charges_json.*.label'  => ['required', 'string', 'max:100'],
            'charges_json.*.amount' => ['required', 'numeric', 'min:0'],
            'total_charges'   => ['sometimes', 'numeric', 'min:0'],
            'grand_total'     => ['sometimes', 'numeric', 'min:0'],

            'customer_notes'   => ['nullable', 'string', 'max:5000'],
            'terms_conditions' => ['nullable', 'string', 'max:5000'],

            'items'                  => ['sometimes', 'array', 'min:1'],
            'items.*.item_id'        => ['nullable', 'integer', 'exists:items,id'],
            'items.*.item_name'      => ['required_with:items', 'string', 'max:255'],
            'items.*.pricelist_id'   => ['nullable', 'integer', 'exists:price_lists,id'],
            'items.*.quantity'       => ['required_with:items', 'numeric', 'min:0.0001'],
            'items.*.unit_price'     => ['required_with:items', 'numeric', 'min:0'],
            'items.*.base_rate'      => ['required_with:items', 'numeric', 'min:0'],
            'items.*.gst_rate'       => ['required_with:items', 'numeric', 'min:0'],
            'items.*.gst_amount'     => ['required_with:items', 'numeric', 'min:0'],
            'items.*.amount'         => ['required_with:items', 'numeric', 'min:0'],
            'items.*.sort_order'     => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            /** @var Invoice $invoice */
            $invoice = $this->route('invoice');
            if (!$invoice instanceof Invoice) return;

            // due_date must not be before invoice_date
            $invoiceDate = $this->input('invoice_date') ?? $invoice->invoice_date;
            $dueDate     = $this->input('due_date');
            if ($dueDate && $invoiceDate && $dueDate < $invoiceDate) {
                $v->errors()->add('due_date', 'Due date cannot be before the invoice date.');
            }

            // Guard against regressing a paid/partially_paid invoice back to draft
            // without going through a proper void flow
            $newStatus = $this->input('status');
            if ($newStatus && in_array($invoice->status, ['paid', 'partially_paid'], true)
                && $newStatus === 'draft') {
                $v->errors()->add('status', 'A paid or partially paid invoice cannot be moved back to draft.');
            }
        });
    }
}
