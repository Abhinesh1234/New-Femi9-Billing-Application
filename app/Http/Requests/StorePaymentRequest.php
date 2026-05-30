<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    protected function prepareForValidation(): void
    {
        $clean = [];
        foreach (['reference_number', 'notes'] as $field) {
            if ($this->has($field) && $this->input($field) !== null) {
                $clean[$field] = strip_tags((string) $this->input($field));
            }
        }
        if (!empty($clean)) $this->merge($clean);
    }

    public function rules(): array
    {
        return [
            'customer_id'      => ['required', 'integer', 'exists:parties,id'],
            'location_id'      => ['nullable', 'integer', 'exists:locations,id'],
            'payment_date'     => ['required', 'date'],
            'amount'           => ['required', 'numeric', 'min:0.01'],
            'payment_mode'     => ['required', 'in:cash,cheque,bank_transfer,credit_card,upi,advance_payment'],
            'bank_charges'     => ['nullable', 'numeric', 'min:0'],
            'tax_deducted'     => ['nullable', 'boolean'],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'notes'            => ['nullable', 'string', 'max:2000'],
            'status'           => ['nullable', 'in:draft,open'],

            // Optional: apply to invoice immediately
            'invoice_id'       => ['nullable', 'integer', 'exists:invoices,id'],
            'applied_amount'   => ['nullable', 'numeric', 'min:0.01'],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_id.required' => 'Please select a customer.',
            'amount.required'      => 'Payment amount is required.',
            'amount.min'           => 'Payment amount must be greater than zero.',
        ];
    }
}
