<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credit_note_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('credit_note_id')->constrained('credit_notes')->cascadeOnDelete();
            $table->foreignId('item_id')->nullable()->constrained('items')->nullOnDelete();
            $table->foreignId('pricelist_id')->nullable()->constrained('price_lists')->nullOnDelete();
            $table->string('item_name', 255);
            $table->decimal('quantity', 15, 4)->default(1);
            $table->decimal('unit_price', 15, 4)->default(0);
            $table->decimal('base_rate', 15, 4)->default(0);
            $table->decimal('gst_rate', 8, 4)->default(0);
            $table->decimal('gst_amount', 15, 2)->default(0);
            $table->decimal('amount', 15, 2)->default(0);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('credit_note_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_note_items');
    }
};
