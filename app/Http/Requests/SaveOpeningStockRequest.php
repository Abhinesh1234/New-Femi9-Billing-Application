<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class SaveOpeningStockRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'entries'                           => 'required|array|min:1',
            'entries.*.location_id'             => 'required|integer|exists:locations,id',
            'entries.*.opening_stock'           => 'required|numeric|min:0|max:9999999.9999',
            'entries.*.opening_stock_value'     => 'required|numeric|min:0|max:9999999.9999',
        ];
    }

    public function messages(): array
    {
        return [
            'entries.required'                          => 'At least one stock entry is required.',
            'entries.min'                               => 'At least one stock entry is required.',
            'entries.*.location_id.required'            => 'A location must be selected for each row.',
            'entries.*.location_id.integer'             => 'Invalid location ID.',
            'entries.*.location_id.exists'              => 'One or more selected locations do not exist.',
            'entries.*.opening_stock.required'          => 'Opening stock quantity is required for each row.',
            'entries.*.opening_stock.numeric'           => 'Opening stock must be a valid number.',
            'entries.*.opening_stock.min'               => 'Opening stock cannot be negative.',
            'entries.*.opening_stock.max'               => 'Opening stock value is too large.',
            'entries.*.opening_stock_value.required'    => 'Opening stock value per unit is required for each row.',
            'entries.*.opening_stock_value.numeric'     => 'Opening stock value must be a valid number.',
            'entries.*.opening_stock_value.min'         => 'Opening stock value cannot be negative.',
            'entries.*.opening_stock_value.max'         => 'Opening stock value is too large.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $entries = $this->input('entries', []);
            if (!is_array($entries) || count($entries) < 2) return;

            $seen = [];
            foreach ($entries as $i => $entry) {
                $locId = $entry['location_id'] ?? null;
                if (!$locId) continue;

                if (in_array((int) $locId, $seen, true)) {
                    $v->errors()->add(
                        "entries.{$i}.location_id",
                        'Each location can only appear once.'
                    );
                } else {
                    $seen[] = (int) $locId;
                }
            }
        });
    }
}
