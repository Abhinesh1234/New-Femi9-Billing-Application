<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('party_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('party_id')->constrained('parties')->cascadeOnDelete();
            $table->foreignId('location_node_id')
                ->constrained('distribution_location_nodes')
                ->cascadeOnDelete();
            $table->timestamp('created_at')->nullable();

            $table->unique(['party_id', 'location_node_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('party_locations');
    }
};
