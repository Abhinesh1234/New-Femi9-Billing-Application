<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->foreignId('distribution_location_node_id')
                  ->nullable()
                  ->after('party_id')
                  ->constrained('distribution_location_nodes')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropForeign(['distribution_location_node_id']);
            $table->dropColumn('distribution_location_node_id');
        });
    }
};
