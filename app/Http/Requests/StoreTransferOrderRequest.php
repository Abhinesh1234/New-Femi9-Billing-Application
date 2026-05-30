<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransferOrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'transfer_number'          => 'required|string|max:100|unique:transfer_orders,transfer_number,' . ($this->route('id') ?? 'NULL'),
            'transfer_date'            => 'required|date',
            'source_location_id'       => 'required|integer|exists:locations,id|different:destination_location_id',
            'destination_location_id'  => 'required|integer|exists:locations,id',
            'reason'                   => 'nullable|string|max:1000',
            'lines'                    => 'required|array|min:1',
            'lines.*.item_id'          => 'required|integer|exists:items,id',
            'lines.*.qty_to_transfer'  => 'required|numeric|min:0.0001',
            'lines.*.description'      => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'source_location_id.different' => 'Source and destination locations must be different.',
            'lines.min'                    => 'At least one line item is required.',
            'lines.*.item_id.required'     => 'Each line must have an item.',
            'lines.*.qty_to_transfer.min'  => 'Transfer quantity must be greater than zero.',
        ];
    }
}
