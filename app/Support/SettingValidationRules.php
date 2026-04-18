<?php

namespace App\Support;

use InvalidArgumentException;

class SettingValidationRules
{
    /**
     * Supported modules and their labels (for error messages).
     */
    public const MODULES = [
        'products' => 'Product Settings',
    ];

    /**
     * Return validation rules for a given module.
     *
     * @throws InvalidArgumentException if the module is not registered.
     */
    public static function forModule(string $module): array
    {
        if (!array_key_exists($module, self::MODULES)) {
            throw new InvalidArgumentException("Unknown settings module: [{$module}].");
        }

        return match ($module) {
            'products' => self::products(),
        };
    }

    /**
     * Validation rules for the Products module settings.
     */
    private static function products(): array
    {
        return [
            'decimal_rate'               => ['required', 'integer', 'between:0,6'],
            'dimension_unit'             => ['required', 'string', 'in:cm,mm,in,ft'],
            'weight_unit'                => ['required', 'string', 'in:kg,g,lb,oz'],
            'barcode_scan_using'         => ['required', 'string', 'in:sku,upc,ean,isbn'],
            'allow_duplicate_names'      => ['required', 'boolean'],
            'enhanced_search'            => ['required', 'boolean'],
            'enable_price_lists'         => ['required', 'boolean'],
            'apply_price_list_line_item' => ['required', 'boolean'],
            'enable_composite_items'     => ['required', 'boolean'],
            'inventory_start_date'       => ['required', 'date', 'date_format:Y-m-d'],
            'enable_serial_tracking'     => ['required', 'boolean'],
            'enable_batch_tracking'      => ['required', 'boolean'],

            // Shown when serial or batch tracking is enabled (Configure modal)
            'tracking_preference'        => ['required_if:enable_serial_tracking,true', 'required_if:enable_batch_tracking,true', 'nullable', 'string', 'in:packages,invoices'],
            'mandate_tracking'           => ['required_if:enable_serial_tracking,true', 'required_if:enable_batch_tracking,true', 'nullable', 'boolean'],

            // Batch tracking sub-options (shown when batch tracking is enabled)
            'allow_duplicate_batch'      => ['sometimes', 'nullable', 'boolean'],
            'allow_qty_to_sold_batch'    => ['sometimes', 'nullable', 'boolean'],
            'allow_diff_selling_price'   => ['sometimes', 'nullable', 'boolean'],

            'prevent_stock_below_zero'   => ['required', 'boolean'],
            'stock_level'                => ['required_if:prevent_stock_below_zero,true', 'nullable', 'string', 'in:org,location'],
            'out_of_stock_warning'       => ['required', 'boolean'],
            'notify_reorder_point'       => ['required', 'boolean'],
            'notify_to_email'            => ['exclude_unless:notify_reorder_point,true', 'required', 'string', 'email'],
            'track_landed_cost'          => ['required', 'boolean'],
        ];
    }
}
