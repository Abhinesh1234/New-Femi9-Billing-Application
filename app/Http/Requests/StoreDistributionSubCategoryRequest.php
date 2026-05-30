<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDistributionSubCategoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'                     => 'required|string|min:1|max:255',
            'distribution_category_id' => [
                'required', 'integer',
                Rule::exists('distribution_categories', 'id')->whereNull('deleted_at'),
            ],
            'description'       => 'nullable|string|max:1000',
            'status'            => 'nullable|string|in:active,inactive',
            'target_amount'     => 'nullable|numeric|min:0',
            'cashback_referral' => 'nullable|string|max:255',
            'parent_id'         => [
                'nullable', 'integer',
                Rule::exists('distribution_sub_categories', 'id')->whereNull('deleted_at'),
            ],
            'linked_location_country_id' => [
                'nullable', 'integer',
                Rule::exists('countries', 'id')->whereNull('deleted_at'),
            ],
            'linked_location_node_id' => [
                'nullable', 'integer',
                Rule::exists('distribution_location_nodes', 'id')->whereNull('deleted_at'),
            ],
            'portal_access'        => 'nullable|boolean',
            'visible_in_hierarchy' => 'nullable|boolean',
        ];
    }

    public function withValidator(\Illuminate\Validation\Validator $validator): void
    {
        $validator->after(function ($v) {
            if ($this->filled('linked_location_country_id') && $this->filled('linked_location_node_id')) {
                $v->errors()->add('linked_location_node_id', 'A sub-category may be linked to a country or a node, not both.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'name.required'                         => 'Sub-category name is required.',
            'name.max'                              => 'Sub-category name cannot exceed 255 characters.',
            'distribution_category_id.required'     => 'Parent distribution category is required.',
            'distribution_category_id.exists'       => 'The selected distribution category does not exist.',
            'code.max'                              => 'Sub-category code cannot exceed 50 characters.',
            'description.max'                       => 'Description cannot exceed 1000 characters.',
            'parent_id.exists'                      => 'The selected parent sub-category does not exist.',
            'linked_location_country_id.exists'     => 'The selected country does not exist.',
            'linked_location_node_id.exists'        => 'The selected location does not exist.',
        ];
    }
}
