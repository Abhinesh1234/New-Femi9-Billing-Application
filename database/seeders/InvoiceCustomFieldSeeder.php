<?php

namespace Database\Seeders;

use App\Models\CustomField;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;

class InvoiceCustomFieldSeeder extends Seeder
{
    public function run(): void
    {
        $fields = [
            [
                'field_key'        => 'discount',
                'label'            => 'Discount',
                'data_type'        => 'percent',
                'is_active'        => true,
                'show_in_all_pdfs' => true,
                'sort_order'       => 1,
            ],
            [
                'field_key'        => 'terms_and_conditions',
                'label'            => 'Terms & Conditions',
                'data_type'        => 'text_multi',
                'is_active'        => true,
                'show_in_all_pdfs' => true,
                'sort_order'       => 2,
            ],
            [
                'field_key'        => 'sales_person',
                'label'            => 'Sales person',
                'data_type'        => 'text_single',
                'is_active'        => true,
                'show_in_all_pdfs' => true,
                'sort_order'       => 3,
            ],
            [
                'field_key'        => 'subject',
                'label'            => 'Subject',
                'data_type'        => 'text_single',
                'is_active'        => true,
                'show_in_all_pdfs' => true,
                'sort_order'       => 4,
            ],
        ];

        foreach ($fields as $field) {
            $existing = CustomField::where('module', 'invoices')
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
                'show_in_transactions' => true,
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
                // Preserve any user-set toggles (is_active, show_in_all_pdfs) but force is_system
                $merged = array_merge($existing->config, $config, ['is_system' => true]);
                $existing->update(['config' => $merged]);
            } else {
                CustomField::create([
                    'module' => 'invoices',
                    'config' => $config,
                ]);
            }
        }

        Cache::forget('custom_fields:invoices');
    }
}
