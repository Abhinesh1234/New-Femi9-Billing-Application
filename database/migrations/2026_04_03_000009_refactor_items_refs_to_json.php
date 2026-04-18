<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('items', function (Blueprint $table) {
            // Drop the 5 individual FK columns
            $table->dropForeign(['hsn_code_id']);
            $table->dropForeign(['gst_rate_id']);
            $table->dropForeign(['sales_account_id']);
            $table->dropForeign(['purchase_account_id']);
            $table->dropForeign(['inventory_account_id']);

            $table->dropColumn([
                'hsn_code_id',
                'gst_rate_id',
                'sales_account_id',
                'purchase_account_id',
                'inventory_account_id',
            ]);

            // Single JSON column for all lookup references
            // Shape: { hsn_code_id, gst_rate_id, sales_account_id, purchase_account_id, inventory_account_id }
            $table->json('refs')->nullable()->after('category_id');
        });
    }

    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropColumn('refs');

            $table->foreignId('hsn_code_id')->nullable()->constrained('hsn_codes')->nullOnDelete()->after('category_id');
            $table->foreignId('gst_rate_id')->nullable()->constrained('gst_rates')->nullOnDelete()->after('hsn_code_id');
            $table->foreignId('sales_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('purchase_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('inventory_account_id')->nullable()->constrained('accounts')->nullOnDelete();
        });
    }
};
