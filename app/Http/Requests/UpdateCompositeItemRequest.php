<?php

namespace App\Http\Requests;

use App\Models\Item;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateCompositeItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $itemId = (int) $this->route('compositeItem');

        return [
            // ── Core ─────────────────────────────────────────────────────────
            'name'            => 'sometimes|required|string|min:1|max:255',
            'composite_type'  => 'sometimes|required|in:assembly,kit',
            'item_type'       => 'sometimes|in:goods,service',
            'unit'            => 'nullable|string|max:50',
            'sku'             => [
                'nullable', 'string', 'max:100',
                Rule::unique('items', 'sku')->ignore($itemId)->whereNull('deleted_at'),
            ],
            'description'     => 'nullable|string|max:5000',
            'image'           => 'nullable|string|max:500',
            'product_tag'     => 'nullable|string|max:100',

            // ── refs ─────────────────────────────────────────────────────────
            'refs'                         => 'nullable|array',
            'refs.brand_id'                => 'nullable|integer|exists:brands,id',
            'refs.category_id'             => 'nullable|integer|exists:categories,id',
            'refs.hsn_code_id'             => 'nullable|integer|exists:hsn_codes,id',
            'refs.gst_rate_id'             => 'nullable|integer|exists:gst_rates,id',
            'refs.sales_account_id'        => 'nullable|integer|exists:accounts,id',
            'refs.purchase_account_id'     => 'nullable|integer|exists:accounts,id',
            'refs.inventory_account_id'    => 'nullable|integer|exists:accounts,id',

            // ── Sales info ────────────────────────────────────────────────────
            'has_sales_info'       => 'boolean',
            'selling_price'        => 'nullable|numeric|min:0|max:9999999999',
            'sales_description'    => 'nullable|string|max:5000',

            // ── Purchase info ─────────────────────────────────────────────────
            'has_purchase_info'    => 'boolean',
            'cost_price'           => 'nullable|numeric|min:0|max:9999999999',
            'purchase_description' => 'nullable|string|max:5000',
            'preferred_vendor'     => 'nullable|string|max:255',

            // ── Inventory ─────────────────────────────────────────────────────
            'track_inventory'      => 'boolean',
            'valuation_method'     => 'nullable|in:fifo,average',
            'reorder_point'        => 'nullable|integer|min:0',

            // ── Fulfilment ────────────────────────────────────────────────────
            'is_returnable'        => 'boolean',
            'dimensions'           => 'nullable|array',
            'dimensions.length'    => 'nullable|numeric|min:0',
            'dimensions.width'     => 'nullable|numeric|min:0',
            'dimensions.height'    => 'nullable|numeric|min:0',
            'dimensions.unit'      => 'nullable|in:cm,mm,in,ft',
            'weight'               => 'nullable|array',
            'weight.value'         => 'nullable|numeric|min:0',
            'weight.unit'          => 'nullable|in:kg,g,lb,oz',

            // ── Identifiers ───────────────────────────────────────────────────
            'identifiers'          => 'nullable|array',
            'identifiers.upc'      => 'nullable|string|max:100',
            'identifiers.mpn'      => 'nullable|string|max:100',
            'identifiers.ean'      => 'nullable|string|max:100',
            'identifiers.isbn'     => 'nullable|string|max:100',

            // ── Custom fields ─────────────────────────────────────────────────
            'custom_fields'        => 'nullable|array',

            // ── Components (optional on update — omit key to leave unchanged) ─
            'components'                          => 'sometimes|array|min:1',
            'components.*.component_item_id'      => 'required_with:components|integer|exists:items,id',
            'components.*.component_type'         => 'required_with:components|in:item,service',
            'components.*.quantity'               => 'required_with:components|numeric|min:0.0001|max:9999999',
            'components.*.selling_price'          => 'nullable|numeric|min:0|max:9999999999',
            'components.*.cost_price'             => 'nullable|numeric|min:0|max:9999999999',
            'components.*.sort_order'             => 'nullable|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'                               => 'Composite item name is required.',
            'name.max'                                    => 'Name cannot exceed 255 characters.',
            'composite_type.required'                     => 'Please select a composite type (Assembly or Kit).',
            'composite_type.in'                           => 'Composite type must be assembly or kit.',
            'sku.unique'                                  => 'This SKU is already in use by another item.',
            'components.min'                              => 'At least one component item is required.',
            'components.*.component_item_id.required_with' => 'Each component must reference a valid item.',
            'components.*.component_item_id.exists'       => 'One or more selected component items do not exist.',
            'components.*.component_type.required_with'   => 'Each component must have a type (item or service).',
            'components.*.quantity.required_with'         => 'Quantity is required for each component.',
            'components.*.quantity.min'                   => 'Quantity must be greater than zero for each component.',
        ];
    }

    /**
     * Cross-field validation: no nesting, no duplicates, no self-reference.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $components = $this->input('components');
            if (!is_array($components) || empty($components)) {
                return; // components key not sent — leave unchanged
            }

            $compositeItemId = (int) $this->route('compositeItem');
            $seenIds         = [];
            $itemIds         = array_column($components, 'component_item_id');
            $itemIds         = array_filter($itemIds, fn($id) => is_numeric($id) && $id > 0);

            if (empty($itemIds)) {
                return;
            }

            $items = Item::whereIn('id', $itemIds)
                ->select('id', 'is_composite', 'name')
                ->get()
                ->keyBy('id');

            foreach ($components as $index => $comp) {
                $id = $comp['component_item_id'] ?? null;
                if (!is_numeric($id) || $id <= 0) {
                    continue;
                }

                $intId = (int) $id;

                // Rule 1: Component cannot be a composite item
                $item = $items->get($intId);
                if ($item && $item->is_composite) {
                    $v->errors()->add(
                        "components.{$index}.component_item_id",
                        "Composite items cannot be nested. \"{$item->name}\" is already a composite item."
                    );
                }

                // Rule 2: Component cannot be the composite item itself
                if ($intId === $compositeItemId) {
                    $v->errors()->add(
                        "components.{$index}.component_item_id",
                        'A composite item cannot include itself as a component.'
                    );
                }

                // Rule 3: No duplicate component_item_id
                if (in_array($intId, $seenIds, true)) {
                    $name = $items->get($intId)?->name ?? "Item #{$intId}";
                    $v->errors()->add(
                        "components.{$index}.component_item_id",
                        "\"{$name}\" is listed more than once. Remove duplicates or adjust the quantity."
                    );
                } else {
                    $seenIds[] = $intId;
                }
            }
        });
    }
}
