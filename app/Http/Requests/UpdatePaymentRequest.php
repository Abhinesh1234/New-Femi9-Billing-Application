<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePaymentRequest extends FormRequest
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
            'payment_date'     => ['sometimes', 'date'],
            'amount'           => ['sometimes', 'numeric', 'min:0.01'],
            'payment_mode'     => ['sometimes', 'in:cash,cheque,bank_transfer,credit_card,upi'],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'notes'            => ['nullable', 'string', 'max:2000'],
        ];
    }
}
