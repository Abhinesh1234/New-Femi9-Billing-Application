<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $addIndex = function (string $table, string|array $columns, ?string $name = null) {
            $cols = (array) $columns;
            $name = $name ?? $table . '_' . implode('_', $cols) . '_perf_idx';
            $existing = collect(DB::select("SHOW INDEX FROM `{$table}`"))->pluck('Key_name');
            if (! $existing->contains($name)) {
                Schema::table($table, function (Blueprint $t) use ($cols, $name) {
                    $t->index($cols, $name);
                });
            }
        };

        $addIndex('invoices', 'customer_id');
        $addIndex('invoices', 'status');
        $addIndex('invoices', 'invoice_date');
        $addIndex('invoices', ['customer_id', 'status']);
        $addIndex('invoices', ['invoice_date', 'status']);
        $addIndex('invoices', 'series_id');
        $addIndex('invoices', 'location_id');
        $addIndex('invoices', 'deleted_at');
        $addIndex('invoice_items', 'invoice_id');
        $addIndex('invoice_items', 'item_id');
        $addIndex('audit_logs', 'user_id');
        $addIndex('audit_logs', 'created_at');
        $addIndex('audit_logs', ['user_id', 'created_at']);
        $addIndex('item_stock', 'item_id');
        $addIndex('personal_access_tokens', ['tokenable_type', 'tokenable_id']);
        $addIndex('personal_access_tokens', 'token');
        $addIndex('user_permissions', 'user_id');
    }

    public function down(): void
    {
        $drop = function (string $table, string $name) {
            $existing = collect(DB::select("SHOW INDEX FROM `{$table}`"))->pluck('Key_name');
            if ($existing->contains($name)) {
                Schema::table($table, fn (Blueprint $t) => $t->dropIndex($name));
            }
        };

        foreach ([
            ['invoices',                'invoices_customer_id_perf_idx'],
            ['invoices',                'invoices_status_perf_idx'],
            ['invoices',                'invoices_invoice_date_perf_idx'],
            ['invoices',                'invoices_customer_id_status_perf_idx'],
            ['invoices',                'invoices_invoice_date_status_perf_idx'],
            ['invoices',                'invoices_series_id_perf_idx'],
            ['invoices',                'invoices_location_id_perf_idx'],
            ['invoices',                'invoices_deleted_at_perf_idx'],
            ['invoice_items',           'invoice_items_invoice_id_perf_idx'],
            ['invoice_items',           'invoice_items_item_id_perf_idx'],
            ['audit_logs',              'audit_logs_user_id_perf_idx'],
            ['audit_logs',              'audit_logs_created_at_perf_idx'],
            ['audit_logs',              'audit_logs_user_id_created_at_perf_idx'],
            ['item_stock',              'item_stock_item_id_perf_idx'],
            ['personal_access_tokens',  'personal_access_tokens_tokenable_type_tokenable_id_perf_idx'],
            ['personal_access_tokens',  'personal_access_tokens_token_perf_idx'],
            ['user_permissions',        'user_permissions_user_id_perf_idx'],
        ] as [$table, $name]) {
            $drop($table, $name);
        }
    }
};
