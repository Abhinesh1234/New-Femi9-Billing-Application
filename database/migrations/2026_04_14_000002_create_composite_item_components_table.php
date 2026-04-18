<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('composite_item_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('composite_item_id')
                  ->constrained('items')
                  ->cascadeOnDelete();
            $table->foreignId('component_item_id')
                  ->constrained('items');
            $table->enum('component_type', ['item', 'service'])->default('item');
            $table->decimal('quantity', 15, 4)->default(1);
            $table->decimal('selling_price', 15, 4)->nullable();
            $table->decimal('cost_price', 15, 4)->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('composite_item_components');
    }
};
