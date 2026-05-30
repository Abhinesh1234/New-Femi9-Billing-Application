<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add a compound index on (party_id, is_active) to locations so that
     * resolveBuyerLocation() lookups are fast (WHERE party_id = ? AND is_active = 1).
     */
    public function up(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->index(['party_id', 'is_active'], 'idx_locations_party_active');
        });
    }

    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropIndex('idx_locations_party_active');
        });
    }
};
