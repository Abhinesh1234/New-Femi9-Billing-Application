<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDistributionCategoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'        => 'required|string|min:1|max:255',
            'code'        => 'nullable|string|max:50',
            'description' => 'nullable|string|max:1000',
            'parent_id'   => [
                'nullable', 'integer',
                Rule::exists('distribution_categories', 'id')->whereNull('deleted_at'),
            ],
            'linked_location_country_id' => [
                'nullable', 'integer',
                Rule::exists('countries', 'id')->whereNull('deleted_at'),
            ],
            'linked_location_node_id' => [
                'nullable', 'integer',
                Rule::exists('distribution_location_nodes', 'id')->whereNull('deleted_at'),
            ],
            'linked_location_depth' => 'nullable|integer|min:1|max:10',
            'portal_access'        => 'nullable|boolean',
            'visible_in_hierarchy' => 'nullable|boolean',
            'role_id'              => ['nullable', 'integer', Rule::exists('roles', 'id')],
        ];
    }

    public function withValidator(\Illuminate\Validation\Validator $validator): void
    {
        $validator->after(function ($v) {
            if ($this->filled('linked_location_country_id') && $this->filled('linked_location_node_id')) {
                $v->errors()->add('linked_location_node_id', 'A category may be linked to a country or a node, not both.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'name.required'                      => 'Category name is required.',
            'name.max'                           => 'Category name cannot exceed 255 characters.',
            'code.max'                           => 'Category code cannot exceed 50 characters.',
            'description.max'                    => 'Description cannot exceed 1000 characters.',
            'parent_id.exists'                   => 'The selected parent category does not exist.',
            'linked_location_country_id.exists'  => 'The selected country does not exist.',
            'linked_location_node_id.exists'     => 'The selected location does not exist.',
        ];
    }
}
