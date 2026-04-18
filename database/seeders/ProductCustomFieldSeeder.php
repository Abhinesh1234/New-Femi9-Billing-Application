<?php

namespace Database\Seeders;

use App\Models\CustomField;
use Illuminate\Database\Seeder;

class ProductCustomFieldSeeder extends Seeder
{
    /**
     * Seed the 7 locked system fields for the products module.
     * Idempotent — skips any field_key that already exists.
     */
    public function run(): void
    {
        $fields = [
            [
                'field_key'        => 'selling_price',
                'label'            => 'Selling Price',
                'data_type'        => 'decimal',
                'is_active'        => true,
                'show_in_all_pdfs' => true,
                'sort_order'       => 1,
            ],
            [
                'field_key'        => 'purchase_price',
                'label'            => 'Purchase Price',
                'data_type'        => 'decimal',
                'is_active'        => true,
                'show_in_all_pdfs' => true,
                'sort_order'       => 2,
            ],
            [
                'field_key'        => 'sku',
                'label'            => 'SKU',
                'data_type'        => 'text_single',
                'is_active'        => true,
                'show_in_all_pdfs' => false,
                'sort_order'       => 3,
            ],
            [
                'field_key'        => 'image',
                'label'            => 'Image',
                'data_type'        => 'image',
                'is_active'        => true,
                'show_in_all_pdfs' => false,
                'sort_order'       => 4,
            ],
            [
                'field_key'        => 'category',
                'label'            => 'Category',
                'data_type'        => 'text_single',
                'is_active'        => false,
                'show_in_all_pdfs' => false,
                'sort_order'       => 5,
            ],
            [
                'field_key'        => 'mrp',
                'label'            => 'MRP',
                'data_type'        => 'decimal',
                'is_active'        => false,
                'show_in_all_pdfs' => false,
                'sort_order'       => 6,
            ],
            [
                'field_key'        => 'alias_name',
                'label'            => 'Alias Name',
                'data_type'        => 'text_single',
                'is_active'        => false,
                'show_in_all_pdfs' => false,
                'sort_order'       => 7,
            ],
        ];

        foreach ($fields as $field) {
            $exists = CustomField::where('module', 'products')
                ->where('config->field_key', $field['field_key'])
                ->exists();

            if ($exists) {
                continue;
            }

            CustomField::create([
                'module' => 'products',
                'config' => [
                    'label'                => $field['label'],
                    'field_key'            => $field['field_key'],
                    'data_type'            => $field['data_type'],
                    'is_mandatory'         => false,
                    'is_active'            => $field['is_active'],
                    'is_system'            => true,
                    'sort_order'           => $field['sort_order'],
                    'help_text'            => null,
                    'show_in_transactions' => false,
                    'show_in_all_pdfs'     => $field['show_in_all_pdfs'],
                    'include_in_modules'   => [],
                    'default_value'        => null,
                    'privacy'              => [
                        'is_pii'       => false,
                        'is_ephi'      => false,
                        'encrypt_data' => false,
                    ],
                    'type_config'          => [],
                ],
            ]);
        }
    }
}
