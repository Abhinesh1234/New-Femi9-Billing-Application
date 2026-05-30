<?php

namespace App\Support;

use InvalidArgumentException;

class SettingValidationRules
{
    /**
     * Supported modules and their labels (for error messages).
     */
    public const MODULES = [
        'products'  => 'Product Settings',
        'customers' => 'Customer & Vendor Settings',
        'invoices'  => 'Invoice Settings',
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
            'products'  => self::products(),
            'customers' => self::customers(),
            'invoices'  => self::invoices(),
        };
    }

    /**
     * Return default configuration values for a module.
     * Used when no saved settings row exists yet (first visit).
     */
    public static function defaults(string $module): ?array
    {
        return match ($module) {
            'products'  => [
                'decimal_rate'               => 2,
                'dimension_unit'             => 'cm',
                'weight_unit'                => 'kg',
                'barcode_scan_using'         => 'sku',
                'allow_duplicate_names'      => false,
                'enhanced_search'            => false,
                'enable_price_lists'         => false,
                'apply_price_list_line_item' => false,
                'enable_composite_items'     => false,
                'inventory_start_date'       => now()->format('Y-m-d'),
                'enable_serial_tracking'     => false,
                'enable_batch_tracking'      => false,
                'tracking_preference'        => 'packages',
                'mandate_tracking'           => true,
                'allow_duplicate_batch'      => false,
                'allow_qty_to_sold_batch'    => false,
                'allow_diff_selling_price'   => false,
                'prevent_stock_below_zero'   => true,
                'stock_level'                => 'org',
                'out_of_stock_warning'       => false,
                'notify_reorder_point'       => false,
                'notify_to_user_ids'         => [],
                'track_landed_cost'          => false,
            ],
            'invoices'  => [
                'allow_edit_sent_invoice'             => true,
                'invoice_order_number'                => 'sales_order_number',
                'notify_online_payment'               => true,
                'include_payment_receipt_thank_you'   => true,
                'automate_thank_you_note'             => false,
                'enable_qr_code'                      => false,
                'qr_code_type'                        => 'invoice_url',
                'qr_upi_id'                           => '',
                'qr_upi_confirm'                      => '',
                'qr_description'                      => 'Scan the QR code to view the configured information.',
                'qr_custom_content'                   => '',
                'hide_zero_value_line_items'          => false,
                'terms_and_conditions'                => '',
                'customer_notes'                      => 'Thanks for your business.',
                'advanced_payment_enabled'            => false,
                'advanced_payment_categories'         => [],
            ],
            'customers' => [
                'allow_duplicate_names'          => false,
                'default_customer_type'          => 'business',
                'credit_limit_enabled'           => false,
                'credit_limit_action'            => 'warn',
                'include_sales_orders_in_credit' => false,
                'billing_address_format'  => implode("\n", [
                    '${CONTACT.CONTACT_DISPLAYNAME}',
                    '${CONTACT.CONTACT_ADDRESS}',
                    '${CONTACT.CONTACT_CITY}',
                    '${CONTACT.CONTACT_CODE} ${CONTACT.CONTACT_STATE}',
                    '${CONTACT.CONTACT_COUNTRY}',
                ]),
                'shipping_address_format' => implode("\n", [
                    '${CONTACT.CONTACT_ADDRESS}',
                    '${CONTACT.CONTACT_CITY}',
                    '${CONTACT.CONTACT_CODE} ${CONTACT.CONTACT_STATE}',
                    '${CONTACT.CONTACT_COUNTRY}',
                ]),
            ],
            default => null,
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
            'notify_to_user_ids'         => ['exclude_unless:notify_reorder_point,true', 'required', 'array', 'min:1'],
            'notify_to_user_ids.*'       => ['integer', 'exists:users,id'],
            'track_landed_cost'          => ['required', 'boolean'],
        ];
    }

    /**
     * Validation rules for the Invoices module settings.
     */
    private static function invoices(): array
    {
        return [
            'allow_edit_sent_invoice'             => ['required', 'boolean'],
            'invoice_order_number'                => ['required', 'string', 'in:sales_order_number,sales_order_ref_number'],
            'notify_online_payment'               => ['required', 'boolean'],
            'include_payment_receipt_thank_you'   => ['required', 'boolean'],
            'automate_thank_you_note'             => ['required', 'boolean'],
            'enable_qr_code'                      => ['required', 'boolean'],
            'qr_code_type'                        => ['nullable', 'string', 'in:upi_id,invoice_url,custom'],
            'qr_upi_id'                           => ['nullable', 'string', 'max:255'],
            'qr_upi_confirm'                      => ['nullable', 'string', 'max:255'],
            'qr_description'                      => ['nullable', 'string', 'max:1000'],
            'qr_custom_content'                   => ['nullable', 'string', 'max:2000'],
            'hide_zero_value_line_items'          => ['required', 'boolean'],
            'terms_and_conditions'                => ['nullable', 'string', 'max:5000'],
            'customer_notes'                      => ['nullable', 'string', 'max:5000'],
            'advanced_payment_enabled'            => ['required', 'boolean'],
            'advanced_payment_categories'         => ['nullable', 'array'],
            'advanced_payment_categories.*'       => ['integer', 'min:1'],
        ];
    }

    /**
     * Validation rules for the Customers & Vendors module settings.
     */
    private static function customers(): array
    {
        return [
            'allow_duplicate_names'          => ['required', 'boolean'],
            'default_customer_type'          => ['required', 'string', 'in:business,individual'],
            'credit_limit_enabled'           => ['required', 'boolean'],
            'credit_limit_action'            => ['required_if:credit_limit_enabled,true', 'nullable', 'string', 'in:restrict,warn'],
            'include_sales_orders_in_credit' => ['required_if:credit_limit_enabled,true', 'nullable', 'boolean'],
            'billing_address_format'         => ['required', 'string', 'max:2000'],
            'shipping_address_format'        => ['required', 'string', 'max:2000'],
        ];
    }
}
