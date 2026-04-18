<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $categoryId = (int) $this->route('category');

        return [
            'name'      => 'sometimes|required|string|min:1|max:255',
            'parent_id' => [
                'nullable', 'integer',
                Rule::exists('categories', 'id'),
                Rule::notIn([$categoryId]),   // cannot set itself as its own parent
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'       => 'Category name is required.',
            'name.max'            => 'Category name cannot exceed 255 characters.',
            'parent_id.exists'    => 'The selected parent category does not exist.',
            'parent_id.not_in'    => 'A category cannot be its own parent.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $categoryId = (int) $this->route('category');
            $parentId   = (int) $this->input('parent_id');
            if (!$parentId) return;

            // Guard against circular ancestry: walk up from parent_id;
            // if we ever land on $categoryId, the move would create a cycle.
            $visited = [];
            $current = $parentId;

            while ($current && !in_array($current, $visited, true)) {
                if ($current === $categoryId) {
                    $v->errors()->add('parent_id', 'This would create a circular category hierarchy.');
                    return;
                }
                $visited[] = $current;
                $row = \App\Models\Category::select('parent_id')->find($current);
                $current = $row ? (int) $row->parent_id : 0;
            }
        });
    }
}
