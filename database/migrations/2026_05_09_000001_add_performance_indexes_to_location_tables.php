<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add composite indexes for common query patterns
        Schema::table('distribution_location_nodes', function (Blueprint $table) {
            // Most-used filter: list children of a node
            $table->index(['country_id', 'parent_id'], 'idx_nodes_country_parent');
            // Used by layer schema guard count query
            $table->index(['country_id', 'depth'], 'idx_nodes_country_depth');
        });

        // Fix location_layer_schemas unique constraint:
        // The original unique index was (country_id, depth) but parent_node_id was added later
        // without updating the constraint, making concurrent upserts unsafe.
        Schema::table('location_layer_schemas', function (Blueprint $table) {
            // Add parent_node_id if it does not yet exist (defensive)
            if (!Schema::hasColumn('location_layer_schemas', 'parent_node_id')) {
                $table->unsignedBigInteger('parent_node_id')->default(0)->after('depth');
            }

            // Replace the two-column unique index with the correct three-column one.
            // On MySQL the (country_id, depth) unique index is the only index backing
            // the country_id foreign key, so it cannot be dropped first (error 1553).
            // Add the replacement composite unique — which still leads with country_id
            // and therefore keeps the FK backed — BEFORE dropping the old one.
            $table->unique(['country_id', 'depth', 'parent_node_id'], 'uq_layer_country_depth_parent');
            $table->dropUnique(['country_id', 'depth']);
        });
    }

    public function down(): void
    {
        Schema::table('distribution_location_nodes', function (Blueprint $table) {
            $table->dropIndex('idx_nodes_country_parent');
            $table->dropIndex('idx_nodes_country_depth');
        });

        Schema::table('location_layer_schemas', function (Blueprint $table) {
            // Re-add the two-column unique (still leads with country_id, keeps the
            // country_id FK backed) BEFORE dropping the three-column one, so MySQL
            // never sees the FK without a covering index (error 1553).
            $table->unique(['country_id', 'depth']);
            $table->dropUnique('uq_layer_country_depth_parent');
        });
    }
};
