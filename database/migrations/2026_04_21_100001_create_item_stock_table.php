<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_stock', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('item_id');
            $table->unsignedBigInteger('location_id');
            $table->decimal('stock_on_hand', 15, 4)->default(0);
            $table->decimal('committed_stock', 15, 4)->default(0);
            $table->decimal('available_for_sale', 15, 4)->default(0);
            $table->timestamps();

            $table->unique(['item_id', 'location_id']);
            $table->foreign('item_id')->references('id')->on('items')->onDelete('cascade');
            $table->foreign('location_id')->references('id')->on('locations')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_stock');
    }
};
