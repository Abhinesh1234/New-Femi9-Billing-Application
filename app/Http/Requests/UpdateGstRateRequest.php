<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGstRateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $gstRateId = (int) $this->route('gstRate');

        return [
            'label' => [
                'sometimes', 'required', 'string', 'max:20',
                Rule::unique('gst_rates', 'label')->ignore($gstRateId)->whereNull('deleted_at'),
            ],
            'rate' => 'sometimes|required|numeric|min:0|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'label.required' => 'GST label is required.',
            'label.max'      => 'Label cannot exceed 20 characters.',
            'label.unique'   => 'A GST rate with this label already exists.',
            'rate.required'  => 'GST rate percentage is required.',
            'rate.min'       => 'Rate cannot be negative.',
            'rate.max'       => 'Rate cannot exceed 100%.',
        ];
    }
}
