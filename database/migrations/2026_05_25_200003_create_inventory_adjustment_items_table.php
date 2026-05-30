<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('inventory_adjustment_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('adjustment_id');
            $table->unsignedBigInteger('item_id')->nullable();
            $table->string('item_name', 255);
            $table->string('item_sku', 100)->nullable();
            $table->string('item_unit', 50)->nullable();
            $table->decimal('cost_price',      15, 4)->default(0);
            $table->decimal('qty_available',   15, 4)->nullable(); // snapshot at time of save
            $table->decimal('new_qty_on_hand', 15, 4)->default(0);
            $table->decimal('qty_adjusted',    15, 4)->default(0); // positive = in, negative = out
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('adjustment_id')->references('id')->on('inventory_adjustments')->cascadeOnDelete();
            $table->foreign('item_id')->references('id')->on('items')->nullOnDelete();

            $table->index('adjustment_id');
            $table->index('item_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_adjustment_items');
    }
};
