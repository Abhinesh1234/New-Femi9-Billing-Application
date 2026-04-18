<?php

namespace App\Support;

class CustomFieldSupport
{
    public const MODULES = [
        'products', 'contacts', 'companies', 'invoices',
        'sales_orders', 'purchase_orders', 'vendors', 'customers',
    ];

    public const DATA_TYPES = [
        'text_single', 'text_multi', 'email', 'url', 'phone',
        'number', 'decimal', 'amount', 'percent',
        'date', 'datetime', 'checkbox', 'auto_generate',
        'dropdown', 'multiselect', 'lookup', 'attachment', 'image',
    ];

    public const INPUT_FORMATS = [
        'numbers', 'alphanumeric_no_spaces', 'alphanumeric_with_spaces',
        'alphanumeric_hyphens_underscores', 'alphabets_no_spaces', 'alphabets_with_spaces',
    ];

    public const LOOKUP_MODULES = [
        'Invoice', 'Sales Order', 'Purchase Order', 'Customers', 'Items',
        'Users', 'Vendors', 'Bill', 'Locations', 'Transfer Order',
        'Sales Receipt', 'Retainer Invoice', 'Package', 'Shipment Order',
        'Picklist', 'Purchase Receive', 'Sales Return', 'Inventory Adjustment',
        'Delivery Challan', 'Customer Payment', 'Credit Note', 'Vendor Payment',
        'Account', 'Sales Person', 'Category', 'Assemblies',
    ];

    public const TRANSACTION_MODULES = [
        'invoice', 'credit_note', 'sales_order', 'delivery_challan',
        'vendor_credits', 'purchase_order', 'purchase_receive', 'bill',
    ];

    public const MAX_OPTIONS = 100;

    /**
     * Base validation rules shared by both store and update.
     */
    public static function baseRules(): array
    {
        $dataTypes  = implode(',', self::DATA_TYPES);
        $txModules  = implode(',', self::TRANSACTION_MODULES);

        return [
            'config'                      => 'required|array',
            'config.label'                => 'required|string|max:255',
            'config.field_key'            => ['required', 'string', 'max:100', 'regex:/^[a-z][a-z0-9_]*$/'],
            'config.data_type'            => "required|in:{$dataTypes}",
            'config.is_mandatory'         => 'sometimes|boolean',
            'config.is_active'            => 'sometimes|boolean',
            'config.sort_order'           => 'sometimes|integer|min:0|max:9999',
            'config.help_text'            => 'nullable|string|max:1000',
            'config.show_in_transactions' => 'sometimes|boolean',
            'config.show_in_all_pdfs'     => 'sometimes|boolean',
            'config.include_in_modules'   => 'sometimes|array|max:8',
            'config.include_in_modules.*' => "string|in:{$txModules}",
            'config.default_value'        => 'nullable|string|max:1000',
            'config.privacy'              => 'sometimes|array',
            'config.privacy.is_pii'       => 'sometimes|boolean',
            'config.privacy.is_ephi'      => 'sometimes|boolean',
            'config.privacy.encrypt_data' => 'sometimes|boolean',
        ];
    }

    /**
     * Extra validation rules for type_config based on the chosen data_type.
     * Called after data_type is known.
     */
    public static function typeConfigRules(string $dataType): array
    {
        $inputFormats = implode(',', self::INPUT_FORMATS);
        $lookupMods   = implode(',', array_map(fn($m) => "\"{$m}\"", self::LOOKUP_MODULES));
        $maxOpts      = self::MAX_OPTIONS;

        return match ($dataType) {
            'text_single' => [
                'config.type_config.input_format'        => "nullable|in:{$inputFormats}",
                'config.type_config.custom_input_format' => 'nullable|string|max:500',
            ],
            'text_multi' => [
                'config.type_config.input_format'        => "nullable|in:{$inputFormats}",
                'config.type_config.custom_input_format' => 'nullable|string|max:500',
                'config.type_config.rich_text_editor'    => 'sometimes|boolean',
            ],
            'url' => [
                'config.type_config.hyperlink_label' => 'nullable|string|max:255',
            ],
            'auto_generate' => [
                'config.type_config.prefix'          => 'nullable|string|max:50|alpha_num',
                'config.type_config.starting_number' => 'required|integer|min:1|max:999999999',
                'config.type_config.suffix'          => 'nullable|string|max:50|alpha_num',
                'config.type_config.add_to_existing' => 'sometimes|boolean',
            ],
            'dropdown' => [
                'config.type_config.add_color'             => 'sometimes|boolean',
                'config.type_config.color_placement'       => 'sometimes|in:next,wrap',
                'config.type_config.options'               => "sometimes|array|max:{$maxOpts}",
                'config.type_config.options.*.label'       => 'required_with:config.type_config.options|string|max:255',
                'config.type_config.options.*.color'       => ['nullable', 'string', 'size:7', 'regex:/^#[0-9A-Fa-f]{6}$/'],
                'config.type_config.options.*.is_active'   => 'sometimes|boolean',
                'config.type_config.options.*.sort_order'  => 'sometimes|integer|min:0',
            ],
            'multiselect' => [
                'config.type_config.options'               => "sometimes|array|max:{$maxOpts}",
                'config.type_config.options.*.label'       => 'required_with:config.type_config.options|string|max:255',
                'config.type_config.options.*.is_active'   => 'sometimes|boolean',
                'config.type_config.options.*.sort_order'  => 'sometimes|integer|min:0',
            ],
            'attachment' => [
                'config.type_config.allowed_file_types'   => 'sometimes|array|min:1|max:4',
                'config.type_config.allowed_file_types.*' => 'in:image,document,pdf,all_files',
            ],
            'lookup' => [
                'config.type_config.lookup_module' => 'required|string|in:' . implode(',', self::LOOKUP_MODULES),
            ],
            // email, phone, number, decimal, amount, percent, date, datetime, checkbox, image
            default => [],
        };
    }
}
