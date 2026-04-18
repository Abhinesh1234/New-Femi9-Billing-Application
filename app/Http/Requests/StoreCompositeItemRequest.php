<?php

namespace App\Http\Requests;

use App\Models\Item;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreCompositeItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // ── Core ─────────────────────────────────────────────────────────
            'name'            => 'required|string|min:1|max:255',
            'composite_type'  => 'required|in:assembly,kit',
            'item_type'       => 'sometimes|in:goods,service',
            'unit'            => 'nullable|string|max:50',
            'sku'             => [
                'nullable', 'string', 'max:100',
                Rule::unique('items', 'sku')->whereNull('deleted_at'),
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

            // ── Components (required, at least one) ───────────────────────────
            'components'                          => 'required|array|min:1',
            'components.*.component_item_id'      => 'required|integer|exists:items,id',
            'components.*.component_type'         => 'required|in:item,service',
            'components.*.quantity'               => 'required|numeric|min:0.0001|max:9999999',
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
            'components.required'                         => 'At least one component item is required.',
            'components.min'                              => 'At least one component item is required.',
            'components.*.component_item_id.required'     => 'Each component must reference a valid item.',
            'components.*.component_item_id.exists'       => 'One or more selected component items do not exist.',
            'components.*.component_type.required'        => 'Each component must have a type (item or service).',
            'components.*.quantity.required'              => 'Quantity is required for each component.',
            'components.*.quantity.min'                   => 'Quantity must be greater than zero for each component.',
            'refs.brand_id.exists'                        => 'Selected brand does not exist.',
            'refs.category_id.exists'                     => 'Selected category does not exist.',
            'refs.sales_account_id.exists'                => 'Selected sales account does not exist.',
            'refs.purchase_account_id.exists'             => 'Selected purchase account does not exist.',
            'refs.inventory_account_id.exists'            => 'Selected inventory account does not exist.',
        ];
    }

    /**
     * Cross-field validation that cannot be expressed as simple rules.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $components = $this->input('components', []);
            if (!is_array($components) || empty($components)) {
                return;
            }

            $seenIds    = [];
            $itemIds    = array_column($components, 'component_item_id');
            $itemIds    = array_filter($itemIds, fn($id) => is_numeric($id) && $id > 0);

            if (empty($itemIds)) {
                return;
            }

            // Fetch all referenced items in one query
            $items = Item::whereIn('id', $itemIds)
                ->select('id', 'is_composite', 'name')
                ->get()
                ->keyBy('id');

            foreach ($components as $index => $comp) {
                $id = $comp['component_item_id'] ?? null;
                if (!is_numeric($id) || $id <= 0) {
                    continue;
                }

                // Rule 1: Component must not itself be a composite item
                $item = $items->get((int) $id);
                if ($item && $item->is_composite) {
                    $v->errors()->add(
                        "components.{$index}.component_item_id",
                        "Composite items cannot be nested. \"{$item->name}\" is already a composite item."
                    );
                }

                // Rule 2: No duplicate component_item_id in the same request
                if (in_array((int) $id, $seenIds, true)) {
                    $name = $items->get((int) $id)?->name ?? "Item #{$id}";
                    $v->errors()->add(
                        "components.{$index}.component_item_id",
                        "\"{$name}\" is listed more than once. Remove duplicates or adjust the quantity."
                    );
                } else {
                    $seenIds[] = (int) $id;
                }
            }
        });
    }
}
