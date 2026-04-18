<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $itemId = $this->route('item');

        return [
            'name'                         => 'sometimes|required|string|max:255',
            'item_type'                    => 'sometimes|required|in:goods,service',
            'form_type'                    => 'sometimes|required|in:single,variants',
            'unit'                         => 'nullable|string|max:50',
            'sku'                          => [
                'nullable', 'string', 'max:100',
                Rule::unique('items', 'sku')->ignore($itemId)->whereNull('deleted_at'),
            ],
            'description'                  => 'nullable|string',
            'image'                        => 'nullable|string|max:500',
            'refs'                             => 'nullable|array',
            'refs.brand_id'                    => 'nullable|integer|exists:brands,id',
            'refs.category_id'                 => 'nullable|integer|exists:categories,id',
            'refs.hsn_code_id'                 => 'nullable|integer|exists:hsn_codes,id',
            'refs.gst_rate_id'                 => 'nullable|integer|exists:gst_rates,id',
            'refs.sales_account_id'            => 'nullable|integer|exists:accounts,id',
            'refs.purchase_account_id'         => 'nullable|integer|exists:accounts,id',
            'refs.inventory_account_id'        => 'nullable|integer|exists:accounts,id',
            'product_tag'                      => 'nullable|string|max:100',
            'has_sales_info'               => 'boolean',
            'selling_price'                => 'nullable|numeric|min:0',
            'sales_description'            => 'nullable|string',
            'has_purchase_info'            => 'boolean',
            'cost_price'                   => 'nullable|numeric|min:0',
            'purchase_description'         => 'nullable|string',
            'preferred_vendor'             => 'nullable|string|max:255',
            'track_inventory'              => 'boolean',
            'valuation_method'             => 'nullable|in:fifo,average',
            'reorder_point'                => 'nullable|integer|min:0',
            'is_returnable'                => 'boolean',
            'dimensions'                   => 'nullable|array',
            'dimensions.length'            => 'nullable|numeric|min:0',
            'dimensions.width'             => 'nullable|numeric|min:0',
            'dimensions.height'            => 'nullable|numeric|min:0',
            'dimensions.unit'              => 'nullable|in:cm,mm,in,ft',
            'weight'                       => 'nullable|array',
            'weight.value'                 => 'nullable|numeric|min:0',
            'weight.unit'                  => 'nullable|in:kg,g,lb,oz',
            'identifiers'                  => 'nullable|array',
            'identifiers.upc'              => 'nullable|string|max:100',
            'identifiers.mpn'              => 'nullable|string|max:100',
            'identifiers.ean'              => 'nullable|string|max:100',
            'identifiers.isbn'             => 'nullable|string|max:100',
            'variation_config'             => 'nullable|array',
            'variation_config.*.attribute' => 'required_with:variation_config|string|max:100',
            'variation_config.*.options'   => 'required_with:variation_config|array|min:1',
            'variation_config.*.options.*' => 'string|max:100',
            'custom_fields'                => 'nullable|array',
            'variants'                     => 'nullable|array',
            'variants.*.combo_key'         => 'required_with:variants|string|max:255',
            'variants.*.name'              => 'nullable|string|max:255',
            'variants.*.sku'               => 'nullable|string|max:100',
            'variants.*.cost_price'        => 'nullable|numeric|min:0',
            'variants.*.selling_price'     => 'nullable|numeric|min:0',
            'variants.*.image'             => 'nullable|string|max:500',

            // ── Composite ─────────────────────────────────────────────────────
            'is_composite'                           => 'boolean',
            'composite_type'                         => 'nullable|in:assembly,kit',
            'components'                             => 'nullable|array',
            'components.*.component_item_id'         => 'required_with:components|integer|exists:items,id',
            'components.*.component_type'            => 'required_with:components|in:item,service',
            'components.*.quantity'                  => 'nullable|numeric|min:0',
            'components.*.selling_price'             => 'nullable|numeric|min:0',
            'components.*.cost_price'                => 'nullable|numeric|min:0',
            'components.*.sort_order'                => 'nullable|integer|min:0',
        ];
    }
}
