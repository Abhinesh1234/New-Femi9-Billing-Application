<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── parties ──────────────────────────────────────────────────────────
        Schema::table('parties', function (Blueprint $table) {
            // Filters on category + sub-category (most common list queries)
            $table->index('distribution_category_id',     'idx_parties_dist_cat');
            $table->index('distribution_sub_category_id', 'idx_parties_dist_sub_cat');
            // Active-only filter used on every list fetch
            $table->index('is_active', 'idx_parties_is_active');
            // Soft-delete filter (deleted_at IS NULL / IS NOT NULL)
            $table->index('deleted_at', 'idx_parties_deleted_at');
        });

        // ── items ─────────────────────────────────────────────────────────────
        Schema::table('items', function (Blueprint $table) {
            // ofType() scope filters by item_type on every list fetch
            $table->index('item_type', 'idx_items_item_type');
            // Composite item filter (exclude_composite param)
            $table->index('is_composite', 'idx_items_is_composite');
            // Soft-delete filter
            $table->index('deleted_at', 'idx_items_deleted_at');
        });
    }

    public function down(): void
    {
        Schema::table('parties', function (Blueprint $table) {
            $table->dropIndex('idx_parties_dist_cat');
            $table->dropIndex('idx_parties_dist_sub_cat');
            $table->dropIndex('idx_parties_is_active');
            $table->dropIndex('idx_parties_deleted_at');
        });

        Schema::table('items', function (Blueprint $table) {
            $table->dropIndex('idx_items_item_type');
            $table->dropIndex('idx_items_is_composite');
            $table->dropIndex('idx_items_deleted_at');
        });
    }
};
