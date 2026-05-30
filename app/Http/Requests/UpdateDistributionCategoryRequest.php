<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateDistributionCategoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = (int) $this->route('distribution_category');

        return [
            'name'        => 'sometimes|required|string|min:1|max:255',
            'code'        => 'nullable|string|max:50',
            'description' => 'nullable|string|max:1000',
            'parent_id'   => [
                'nullable', 'integer',
                Rule::exists('distribution_categories', 'id')->whereNull('deleted_at'),
                Rule::notIn([$id]),
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

    public function messages(): array
    {
        return [
            'name.required'                      => 'Category name is required.',
            'name.max'                           => 'Category name cannot exceed 255 characters.',
            'code.max'                           => 'Category code cannot exceed 50 characters.',
            'description.max'                    => 'Description cannot exceed 1000 characters.',
            'parent_id.exists'                   => 'The selected parent category does not exist.',
            'parent_id.not_in'                   => 'A category cannot be its own parent.',
            'linked_location_country_id.exists'  => 'The selected country does not exist.',
            'linked_location_node_id.exists'     => 'The selected location does not exist.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $id       = (int) $this->route('distribution_category');
            $parentId = (int) $this->input('parent_id');
            if (!$parentId) return;

            $visited = [];
            $current = $parentId;

            while ($current && !in_array($current, $visited, true)) {
                if ($current === $id) {
                    $v->errors()->add('parent_id', 'This would create a circular category hierarchy.');
                    return;
                }
                $visited[] = $current;
                $row = \App\Models\DistributionCategory::select('parent_id')->find($current);
                $current = $row ? (int) $row->parent_id : 0;
            }

            if ($this->filled('linked_location_country_id') && $this->filled('linked_location_node_id')) {
                $v->errors()->add('linked_location_node_id', 'A category may be linked to a country or a node, not both.');
            }
        });
    }
}
