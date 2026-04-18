<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAccountRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'required|string|min:1|max:255',
            'type' => 'required|in:sales,purchase,inventory',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Account name is required.',
            'name.max'      => 'Account name cannot exceed 255 characters.',
            'type.required' => 'Account type is required.',
            'type.in'       => 'Account type must be one of: Sales, Purchase, Inventory.',
        ];
    }
}
