<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDistributionLocationNodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $node = $this->route('distributionLocationNode');

        return [
            'name' => [
                'required', 'string', 'max:150',
                Rule::unique('distribution_location_nodes')
                    ->ignore($node)
                    ->where('country_id', $node->country_id)
                    ->where('parent_id', $node->parent_id),
            ],
            'code'      => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'A location with this name already exists at this level.',
        ];
    }
}
