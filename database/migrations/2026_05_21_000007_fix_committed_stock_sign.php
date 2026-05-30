<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Committed stock was being written as −qty (negative) for commits and
     * +qty for uncommits. The formula `available = on_hand − committed`
     * then over-counted available (subtracting a negative = adding).
     *
     * Fix: negate all existing committed_change values in the ledger so
     * commits are positive and uncommits are negative, then recalculate
     * item_stock snapshots from the corrected ledger.
     */
    public function up(): void
    {
        // 1. Flip signs in ledger (only rows that actually have a committed change)
        DB::statement('
            UPDATE item_stock_ledger
            SET committed_change = -committed_change
            WHERE committed_change != 0
        ');

        // 2. Recalculate item_stock snapshots from the corrected ledger
        DB::statement('
            UPDATE item_stock snap
            JOIN (
                SELECT
                    item_id,
                    location_id,
                    SUM(qty_change)        AS total_qty,
                    SUM(committed_change)  AS total_committed
                FROM item_stock_ledger
                GROUP BY item_id, location_id
            ) calc
                ON snap.item_id     = calc.item_id
               AND snap.location_id = calc.location_id
            SET
                snap.stock_on_hand      = calc.total_qty,
                snap.committed_stock    = calc.total_committed,
                snap.available_for_sale = calc.total_qty - calc.total_committed
        ');
    }

    public function down(): void
    {
        // Reverse: flip signs back, recalculate
        DB::statement('
            UPDATE item_stock_ledger
            SET committed_change = -committed_change
            WHERE committed_change != 0
        ');

        DB::statement('
            UPDATE item_stock snap
            JOIN (
                SELECT
                    item_id,
                    location_id,
                    SUM(qty_change)        AS total_qty,
                    SUM(committed_change)  AS total_committed
                FROM item_stock_ledger
                GROUP BY item_id, location_id
            ) calc
                ON snap.item_id     = calc.item_id
               AND snap.location_id = calc.location_id
            SET
                snap.stock_on_hand      = calc.total_qty,
                snap.committed_stock    = calc.total_committed,
                snap.available_for_sale = calc.total_qty + calc.total_committed
        ');
    }
};
