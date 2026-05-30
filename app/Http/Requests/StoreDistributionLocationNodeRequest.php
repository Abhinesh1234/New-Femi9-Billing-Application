<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDistributionLocationNodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $countryId = $this->integer('country_id');
        $parentId  = $this->input('parent_id'); // null or int

        return [
            'country_id' => ['required', 'integer', 'exists:countries,id'],
            'parent_id'  => ['nullable', 'integer', 'exists:distribution_location_nodes,id'],
            'depth'      => ['required', 'integer', 'min:1'],
            'name'       => [
                'required', 'string', 'max:150',
                Rule::unique('distribution_location_nodes')
                    ->where('country_id', $countryId)
                    ->where('parent_id', $parentId),
            ],
            'code'       => ['nullable', 'string', 'max:50'],
            'is_active'  => ['boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $parentId  = $this->input('parent_id');
            $countryId = $this->integer('country_id');
            $depth     = $this->integer('depth');

            if ($parentId !== null) {
                $parent = \App\Models\DistributionLocationNode::withTrashed()->find((int) $parentId);

                if (!$parent) {
                    $validator->errors()->add('parent_id', 'Parent location not found.');
                    return;
                }
                if ($parent->trashed()) {
                    $validator->errors()->add('parent_id', 'Parent location has been deleted.');
                    return;
                }
                if ((int) $parent->country_id !== $countryId) {
                    $validator->errors()->add('parent_id', 'Parent location belongs to a different country.');
                    return;
                }
                if ($depth !== $parent->depth + 1) {
                    $validator->errors()->add('depth', 'Depth must equal parent depth + 1.');
                }
            } else {
                if ($depth !== 1) {
                    $validator->errors()->add('depth', 'Root-level locations must have depth 1.');
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'A location with this name already exists at this level.',
        ];
    }
}
