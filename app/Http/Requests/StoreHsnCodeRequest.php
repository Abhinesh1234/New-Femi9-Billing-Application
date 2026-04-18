<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreHsnCodeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'code'        => [
                'required', 'string', 'max:20',
                Rule::unique('hsn_codes', 'code')->whereNull('deleted_at'),
            ],
            'description' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'HSN code is required.',
            'code.max'      => 'HSN code cannot exceed 20 characters.',
            'code.unique'   => 'This HSN code already exists.',
            'description.max' => 'Description cannot exceed 500 characters.',
        ];
    }
}
