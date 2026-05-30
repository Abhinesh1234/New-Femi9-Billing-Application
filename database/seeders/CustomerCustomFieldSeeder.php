<?php

namespace Database\Seeders;

use App\Models\CustomField;
use Illuminate\Database\Seeder;

class CustomerCustomFieldSeeder extends Seeder
{
    /**
     * Seed locked system fields for the customers module.
     * Uses updateOrCreate so re-running is safe and will correct
     * any existing entry that was created without is_system = true.
     */
    public function run(): void
    {
        $fields = [
            [
                'field_key'        => 'price_list',
                'label'            => 'Price List',
                'data_type'        => 'text_single',
                'is_active'        => true,
                'show_in_all_pdfs' => false,
                'sort_order'       => 1,
            ],
        ];

        foreach ($fields as $field) {
            $existing = CustomField::where('module', 'customers')
                ->where('config->field_key', $field['field_key'])
                ->first();

            $config = [
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
            ];

            if ($existing) {
                $existing->update(['config' => $config]);
            } else {
                CustomField::create([
                    'module' => 'customers',
                    'config' => $config,
                ]);
            }
        }
    }
}
