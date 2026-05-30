<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
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
                'adjustment_in',
                'adjustment_out',
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
                'uncommit',
                'assembly_consumed',
                'assembly_produced'
            ) NOT NULL
        ");
    }
};
