<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // ── Core ─────────────────────────────────────────────────────────
            'name'                         => 'required|string|max:255',
            'item_type'                    => 'required|in:goods,service',
            'form_type'                    => 'required|in:single,variants',
            'unit'                         => 'nullable|string|max:50',
            'sku'                          => [
                'nullable', 'string', 'max:100',
                Rule::unique('items', 'sku')->whereNull('deleted_at'),
            ],
            'description'                  => 'nullable|string',
            'image'                        => 'nullable|string|max:500',

            // ── refs — all FK IDs in one JSON column ──────────────────────────
            'refs'                             => 'nullable|array',
            'refs.brand_id'                    => 'nullable|integer|exists:brands,id',
            'refs.category_id'                 => 'nullable|integer|exists:categories,id',
            'refs.hsn_code_id'                 => 'nullable|integer|exists:hsn_codes,id',
            'refs.gst_rate_id'                 => 'nullable|integer|exists:gst_rates,id',
            'refs.sales_account_id'            => 'nullable|integer|exists:accounts,id',
            'refs.purchase_account_id'         => 'nullable|integer|exists:accounts,id',
            'refs.inventory_account_id'        => 'nullable|integer|exists:accounts,id',
            'product_tag'                      => 'nullable|string|max:100',

            // ── Sales ─────────────────────────────────────────────────────────
            'has_sales_info'               => 'boolean',
            'selling_price'                => 'nullable|numeric|min:0',
            'sales_description'            => 'nullable|string',

            // ── Purchase ──────────────────────────────────────────────────────
            'has_purchase_info'            => 'boolean',
            'cost_price'                   => 'nullable|numeric|min:0',
            'purchase_description'         => 'nullable|string',
            'preferred_vendor'             => 'nullable|string|max:255',

            // ── Inventory ─────────────────────────────────────────────────────
            'track_inventory'              => 'boolean',
            'valuation_method'             => 'nullable|in:fifo,average',
            'reorder_point'                => 'nullable|integer|min:0',

            // ── Fulfilment ────────────────────────────────────────────────────
            'is_returnable'                => 'boolean',
            'dimensions'                   => 'nullable|array',
            'dimensions.length'            => 'nullable|numeric|min:0',
            'dimensions.width'             => 'nullable|numeric|min:0',
            'dimensions.height'            => 'nullable|numeric|min:0',
            'dimensions.unit'              => 'nullable|in:cm,mm,in,ft',
            'weight'                       => 'nullable|array',
            'weight.value'                 => 'nullable|numeric|min:0',
            'weight.unit'                  => 'nullable|in:kg,g,lb,oz',

            // ── Identifiers ───────────────────────────────────────────────────
            'identifiers'                  => 'nullable|array',
            'identifiers.upc'              => 'nullable|string|max:100',
            'identifiers.mpn'              => 'nullable|string|max:100',
            'identifiers.ean'              => 'nullable|string|max:100',
            'identifiers.isbn'             => 'nullable|string|max:100',

            // ── Variation config ──────────────────────────────────────────────
            'variation_config'             => 'nullable|array',
            'variation_config.*.attribute' => 'required_with:variation_config|string|max:100',
            'variation_config.*.options'   => 'required_with:variation_config|array|min:1',
            'variation_config.*.options.*' => 'string|max:100',

            // ── Custom fields ─────────────────────────────────────────────────
            'custom_fields'                => 'nullable|array',

            // ── Variants ──────────────────────────────────────────────────────
            'variants'                     => 'nullable|array',
            'variants.*.combo_key'         => 'required_with:variants|string|max:255',
            'variants.*.name'              => 'nullable|string|max:255',
            'variants.*.sku'               => 'nullable|string|max:100',
            'variants.*.cost_price'        => 'nullable|numeric|min:0',
            'variants.*.selling_price'     => 'nullable|numeric|min:0',
            'variants.*.image'             => 'nullable|string|max:500',

            // ── Access ───────────────────────────────────────────────────────
            'admin_only'                             => 'boolean',

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

    public function messages(): array
    {
        return [
            'name.required'                         => 'Item name is required.',
            'item_type.in'                          => 'Item type must be goods or service.',
            'form_type.in'                          => 'Form type must be single or variants.',
            'sku.unique'                            => 'This SKU is already in use.',
            'variation_config.*.attribute.required_with' => 'Each variation must have an attribute name.',
            'variation_config.*.options.min'        => 'Each variation must have at least one option.',
        ];
    }
}
