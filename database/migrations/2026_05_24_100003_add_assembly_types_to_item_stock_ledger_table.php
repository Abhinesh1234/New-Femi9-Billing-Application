<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // MySQL requires listing ALL current + new enum values when altering an enum column.
        DB::statement("
            ALTER TABLE `item_stock_ledger`
            MODIFY COLUMN `transaction_type` ENUM(
                'opening',
                'purchase',
                'sale',
                'sale_return',
                'purchase_return',
                'transfer_in',
                'transfer_out',
                'adjustment',
                'commit',
                'uncommit',
                'assembly_consumed',
                'assembly_produced'
            ) NOT NULL
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE `item_stock_ledger`
            MODIFY COLUMN `transaction_type` ENUM(
                'opening',
                'purchase',
                'sale',
                'sale_return',
                'purchase_return',
                'transfer_in',
                'transfer_out',
                'adjustment',
                'commit',
                'uncommit'
            ) NOT NULL
        ");
    }
};
