<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('item_stock_ledger', function (Blueprint $table) {
            // For "show all movements for invoice #X"
            $table->index(['reference_type', 'reference_id'], 'idx_stock_ledger_reference');

            // For "show all movements at a location between dates"
            $table->index(['location_id', 'transaction_date'], 'idx_stock_ledger_location_date');
        });
    }

    public function down(): void
    {
        Schema::table('item_stock_ledger', function (Blueprint $table) {
            $table->dropIndex('idx_stock_ledger_reference');
            $table->dropIndex('idx_stock_ledger_location_date');
        });
    }
};
