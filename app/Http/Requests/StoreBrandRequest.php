<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBrandRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => [
                'required', 'string', 'min:1', 'max:255',
                Rule::unique('brands', 'name')->whereNull('deleted_at'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Brand name is required.',
            'name.max'      => 'Brand name cannot exceed 255 characters.',
            'name.unique'   => 'A brand with this name already exists.',
        ];
    }
}
