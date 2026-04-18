<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * price_list_items
     * ----------------
     * One row per item per price list (for individual_items type only).
     *
     * Unit pricing   → custom_rate + discount columns (decimal, indexed,
     *                  arithmetic-safe, can be queried/sorted directly)
     *
     * Volume pricing → volume_ranges JSON column.
     *                  Ranges are always read as a set — never individually —
     *                  so JSON avoids a separate table with 3-4× more rows.
     *
     *   volume_ranges shape:
     *   [
     *     { "start_qty": 1,  "end_qty": 10, "custom_rate": 95.0000, "discount": null },
     *     { "start_qty": 11, "end_qty": 50, "custom_rate": 90.0000, "discount": 5.00 }
     *   ]
     *
     * The active pricing_scheme is stored in price_lists.settings so the
     * application always knows which column set to use.
     */
    public function up(): void
    {
        Schema::create('price_list_items', function (Blueprint $table) {

            // ── Primary key ───────────────────────────────────────────────
            $table->id();

            // ── Relationships ─────────────────────────────────────────────
            $table->unsignedBigInteger('price_list_id');
            $table->unsignedBigInteger('item_id');

            // ── Unit pricing columns ──────────────────────────────────────
            // Precision (15,4): supports values up to 99,999,999,999.9999
            $table->decimal('custom_rate', 15, 4)->nullable();

            // Discount as a percentage (0.00 – 100.00)
            $table->decimal('discount', 5, 2)->nullable();

            // ── Volume pricing ────────────────────────────────────────────
            // JSON array of range objects — see docblock above
            $table->json('volume_ranges')->nullable();

            // ── Audit ─────────────────────────────────────────────────────
            $table->timestamps();

            // ── Constraints ───────────────────────────────────────────────
            $table->foreign('price_list_id')
                  ->references('id')->on('price_lists')
                  ->cascadeOnDelete();   // removing a price list removes its items

            $table->foreign('item_id')
                  ->references('id')->on('items')
                  ->cascadeOnDelete();   // removing an item removes its price entries

            // Prevents duplicate item rows within the same price list
            $table->unique(['price_list_id', 'item_id'], 'uq_pli_pricelist_item');

            // ── Indexes ───────────────────────────────────────────────────

            // Covered by the unique key above — explicit for clarity and
            // to satisfy the FK constraint requirement on price_list_id.
            // (Most engines create this automatically from the unique key.)

            // Reverse lookup: "which price lists contain this item?"
            // Used when an item is updated to invalidate / recalculate pricing.
            $table->index('item_id', 'idx_pli_item_id');

            // Composite covering index for the primary read path:
            // "load all items for price list X, return rate + discount"
            // Covers: WHERE price_list_id = ? → SELECT custom_rate, discount
            $table->index(['price_list_id', 'custom_rate', 'discount'], 'idx_pli_pricelist_rate');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('price_list_items');
    }
};
