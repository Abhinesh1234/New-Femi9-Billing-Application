<?php

namespace App\Http\Requests;

use App\Models\CustomField;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('edit', 'items') ?? false;
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
            'description'                  => 'nullable|string|max:5000',
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
            'sales_description'            => 'nullable|string|max:5000',
            'has_purchase_info'            => 'boolean',
            'cost_price'                   => 'nullable|numeric|min:0',
            'purchase_description'         => 'nullable|string|max:5000',
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
            // Exclude this item's own existing variants from the unique check (they will be forceDeleted then recreated)
            'variants.*.sku'               => [
                'nullable', 'string', 'max:100',
                Rule::unique('item_variants', 'sku')->where(fn($q) => $q->where('item_id', '!=', $itemId)),
            ],
            'variants.*.cost_price'        => 'nullable|numeric|min:0',
            'variants.*.selling_price'     => 'nullable|numeric|min:0',
            'variants.*.image'             => 'nullable|string|max:500',

            // ── Points ────────────────────────────────────────────────────────
            'points'                               => 'sometimes|required|integer|min:0',

            // ── Access ───────────────────────────────────────────────────────
            'admin_only'                             => 'boolean',

            // ── Composite ─────────────────────────────────────────────────────
            'is_composite'                           => 'boolean',
            'composite_type'                         => 'nullable|in:assembly,kit',
            'components'                             => 'nullable|array',
            'components.*.component_item_id'         => 'required_with:components|integer|exists:items,id',
            'components.*.component_type'            => 'required_with:components|in:item,service',
            'components.*.quantity'                  => 'required_with:components|numeric|min:0.001',
            'components.*.selling_price'             => 'nullable|numeric|min:0',
            'components.*.cost_price'                => 'nullable|numeric|min:0',
            'components.*.sort_order'                => 'nullable|integer|min:0',
        ];
    }

    public function withValidator(\Illuminate\Validation\Validator $validator): void
    {
        $validator->after(function (\Illuminate\Validation\Validator $v) {
            // ── Composite type required if being set ──────────────────────────
            if ($this->has('is_composite') && $this->boolean('is_composite') && !$this->filled('composite_type')) {
                $v->errors()->add('composite_type', 'Composite type (assembly or kit) is required for composite items.');
            }

            // ── Single form must not carry variants ───────────────────────────
            if ($this->input('form_type') === 'single' && !empty($this->input('variants', []))) {
                $v->errors()->add('variants', 'A single-type item cannot have variants.');
            }

            // ── Variant form must supply variation config ──────────────────────
            if ($this->input('form_type') === 'variants') {
                $config = $this->input('variation_config', []);
                if (empty($config) || !is_array($config)) {
                    $v->errors()->add('variation_config', 'At least one variation attribute with options is required for variant items.');
                }
            }

            // ── track_inventory requires valuation_method ──────────────────────
            if ($this->has('track_inventory') && $this->boolean('track_inventory') && !$this->filled('valuation_method')) {
                $v->errors()->add('valuation_method', 'A valuation method (FIFO or average) is required when inventory tracking is enabled.');
            }

            // ── Intra-request variant SKU uniqueness ──────────────────────────
            $variants = $this->input('variants', []);
            if (!empty($variants)) {
                $seen = [];
                foreach ($variants as $i => $variant) {
                    $sku = $variant['sku'] ?? null;
                    if (!$sku) continue;
                    if (isset($seen[$sku])) {
                        $v->errors()->add("variants.{$i}.sku", "Variant SKU '{$sku}' must be unique within this item.");
                    } else {
                        $seen[$sku] = true;
                    }
                }
            }

            // ── Custom fields schema validation ────────────────────────────────
            $customFields = $this->input('custom_fields', []);
            if (!empty($customFields) && is_array($customFields)) {
                $schema = CustomField::where('module', 'products')
                    ->get()
                    ->filter(fn($f) => $f->config['is_active'] ?? false)
                    ->keyBy(fn($f) => $f->config['field_key'] ?? '');

                foreach ($customFields as $key => $value) {
                    if (!$schema->has($key)) continue;
                    $cfg      = $schema->get($key)->config ?? [];
                    $label    = $cfg['label']    ?? $key;
                    $dataType = $cfg['data_type'] ?? 'text_single';
                    $required = $cfg['required']  ?? false;

                    if ($required && ($value === null || $value === '')) {
                        $v->errors()->add("custom_fields.{$key}", "The {$label} field is required.");
                        continue;
                    }

                    if ($value === null || $value === '') continue;

                    switch ($dataType) {
                        case 'number': case 'decimal': case 'amount': case 'percent':
                            if (!is_numeric($value)) {
                                $v->errors()->add("custom_fields.{$key}", "The {$label} must be a number.");
                            }
                            break;
                        case 'email':
                            if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                                $v->errors()->add("custom_fields.{$key}", "The {$label} must be a valid email address.");
                            }
                            break;
                        case 'url':
                            if (!filter_var($value, FILTER_VALIDATE_URL)) {
                                $v->errors()->add("custom_fields.{$key}", "The {$label} must be a valid URL.");
                            }
                            break;
                    }
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'variants.*.sku.unique'           => 'This variant SKU is already in use by another item.',
            'components.*.quantity.min'        => 'Component quantity must be greater than zero.',
            'components.*.quantity.required_with' => 'Component quantity is required.',
        ];
    }
}
