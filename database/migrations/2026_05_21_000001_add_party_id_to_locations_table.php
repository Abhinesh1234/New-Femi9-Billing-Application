<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->foreignId('party_id')
                ->nullable()
                ->after('id')
                ->constrained('parties')
                ->nullOnDelete();

            $table->index('party_id', 'idx_locations_party_id');
        });
    }

    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropForeign(['party_id']);
            $table->dropIndex('idx_locations_party_id');
            $table->dropColumn('party_id');
        });
    }
};
