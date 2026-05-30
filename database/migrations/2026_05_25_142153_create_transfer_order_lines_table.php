<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transfer_order_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transfer_order_id')->constrained('transfer_orders')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('items');
            $table->decimal('qty_to_transfer', 15, 4);
            // Snapshot of stock at both locations taken when order is initiated
            $table->decimal('source_qty_snapshot', 15, 4)->nullable();
            $table->decimal('dest_qty_snapshot',   15, 4)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transfer_order_lines');
    }
};
