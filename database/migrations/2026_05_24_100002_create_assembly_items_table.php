<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assembly_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('assembly_id');
            $table->unsignedBigInteger('item_id');
            $table->string('item_name');
            $table->string('item_unit')->nullable();
            $table->decimal('quantity_required', 15, 4);
            $table->decimal('total_quantity', 15, 4);
            $table->decimal('cost_price', 15, 4)->default(0);
            $table->timestamps();

            $table->foreign('assembly_id')->references('id')->on('assemblies')->onDelete('cascade');
            $table->foreign('item_id')->references('id')->on('items');
            $table->index('assembly_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assembly_items');
    }
};
