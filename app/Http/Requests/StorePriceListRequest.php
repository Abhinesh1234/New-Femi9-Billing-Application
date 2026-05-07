<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StorePriceListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // ── Core ─────────────────────────────────────────────────────────
            'name'                   => 'required|string|max:255',
            'transaction_type'       => 'required|in:sales,purchase,both',
            'customer_category_id'   => 'nullable|integer',
            'price_list_type'        => 'required|in:all_items,individual_items',
            'description'            => 'nullable|string',
            'is_active'              => 'boolean',
            'admin_only'             => 'boolean',

            // ── Settings JSON ─────────────────────────────────────────────────
            'settings'                          => 'nullable|array',

            // all_items settings
            'settings.adjustment_method'        => 'nullable|in:markup,markdown',
            'settings.percentage'               => 'nullable|numeric|min:0|max:100',
            'settings.round_off'                => 'nullable|string|max:50',

            // individual_items settings
            'settings.pricing_scheme'           => 'nullable|in:unit,volume',
            'settings.currency'                 => 'nullable|string|max:50',
            'settings.include_discount'         => 'nullable|boolean',

            // ── Individual item pricing rows ───────────────────────────────────
            'items'                             => 'nullable|array',
            'items.*.item_id'                   => 'required_with:items|integer|exists:items,id',
            'items.*.custom_rate'               => 'nullable|numeric|min:0',
            'items.*.discount'                  => 'nullable|numeric|min:0|max:100',
            'items.*.volume_ranges'             => 'nullable|array',
            'items.*.volume_ranges.*.start_qty' => 'nullable|numeric|min:0',
            'items.*.volume_ranges.*.end_qty'   => 'nullable|numeric|min:0',
            'items.*.volume_ranges.*.custom_rate'=> 'nullable|numeric|min:0',
            'items.*.volume_ranges.*.discount'  => 'nullable|numeric|min:0|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'                        => 'Price list name is required.',
            'transaction_type.required'            => 'Transaction type is required.',
            'transaction_type.in'                  => 'Transaction type must be Sales, Purchase, or Both.',
            'price_list_type.required'             => 'Price list type is required.',
            'items.*.item_id.required_with'        => 'Each item row must reference a valid item.',
            'items.*.item_id.exists'               => 'One or more selected items do not exist.',
            'items.*.discount.max'                 => 'Discount cannot exceed 100%.',
            'items.*.volume_ranges.*.discount.max' => 'Volume range discount cannot exceed 100%.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $items = $this->input('items');
            if (!is_array($items)) return;

            // Rule 1: no duplicate item_id in the same request
            $seenItemIds = [];
            foreach ($items as $i => $item) {
                $id = (int) ($item['item_id'] ?? 0);
                if (!$id) continue;
                if (in_array($id, $seenItemIds, true)) {
                    $v->errors()->add("items.{$i}.item_id", 'This item is listed more than once.');
                } else {
                    $seenItemIds[] = $id;
                }
            }

            foreach ($items as $i => $item) {
                $ranges = $item['volume_ranges'] ?? [];
                if (!is_array($ranges)) continue;

                // Rule 2: end_qty must be >= start_qty
                foreach ($ranges as $j => $range) {
                    $start = (float) ($range['start_qty'] ?? 0);
                    $end   = isset($range['end_qty']) ? (float) $range['end_qty'] : null;
                    if ($end !== null && $end < $start) {
                        $v->errors()->add(
                            "items.{$i}.volume_ranges.{$j}.end_qty",
                            'End quantity must be greater than or equal to start quantity.'
                        );
                    }
                }

                // Rule 3: volume ranges must not overlap
                if (count($ranges) < 2) continue;
                $sorted = $ranges;
                usort($sorted, fn($a, $b) => ($a['start_qty'] ?? 0) <=> ($b['start_qty'] ?? 0));
                for ($j = 1; $j < count($sorted); $j++) {
                    $prevEnd   = (float) ($sorted[$j - 1]['end_qty'] ?? 0);
                    $currStart = (float) ($sorted[$j]['start_qty'] ?? 0);
                    if ($prevEnd > 0 && $currStart <= $prevEnd) {
                        $v->errors()->add(
                            "items.{$i}.volume_ranges",
                            "Volume ranges for an item must not overlap (range starting at {$currStart} overlaps with the previous range ending at {$prevEnd})."
                        );
                        break;
                    }
                }
            }
        });
    }
}
