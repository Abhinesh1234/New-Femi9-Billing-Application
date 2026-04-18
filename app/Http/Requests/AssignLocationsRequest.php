<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignLocationsRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'location_ids'   => 'present|array',
            'location_ids.*' => 'integer|exists:locations,id',
        ];
    }

    public function messages(): array
    {
        return [
            'location_ids.present'  => 'A location_ids array is required (may be empty to unassign all).',
            'location_ids.*.exists' => 'One or more selected locations do not exist.',
        ];
    }
}
