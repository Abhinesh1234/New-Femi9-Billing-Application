<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('location_layer_schemas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->constrained('countries')->onDelete('cascade');
            $table->unsignedTinyInteger('depth'); // 1-based: 1 = first layer under country
            $table->string('layer_name', 50);     // e.g. "State", "District"
            $table->timestamps();

            $table->unique(['country_id', 'depth']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('location_layer_schemas');
    }
};
