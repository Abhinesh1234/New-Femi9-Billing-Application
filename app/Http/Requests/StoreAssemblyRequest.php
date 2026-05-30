<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssemblyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'composite_item_id'  => ['required', 'integer', 'exists:items,id'],
            'location_id'        => ['required', 'integer', 'exists:locations,id'],
            'assembled_date'     => ['required', 'date'],
            'quantity_to_assemble' => ['required', 'numeric', 'gt:0'],
            'description'        => ['nullable', 'string', 'max:1000'],

            'items'                          => ['required', 'array', 'min:1'],
            'items.*.item_id'                => ['required', 'integer', 'exists:items,id'],
            'items.*.item_name'              => ['required', 'string'],
            'items.*.item_unit'              => ['nullable', 'string'],
            'items.*.quantity_required'      => ['required', 'numeric', 'gt:0'],
            'items.*.total_quantity'         => ['required', 'numeric', 'gt:0'],
            'items.*.cost_price'             => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'composite_item_id.required' => 'Please select a composite item.',
            'location_id.required'       => 'Please select a location.',
            'assembled_date.required'    => 'Please enter the assembled date.',
            'quantity_to_assemble.gt'    => 'Quantity to assemble must be greater than zero.',
            'items.required'             => 'At least one component item is required.',
            'items.min'                  => 'At least one component item is required.',
        ];
    }
}
