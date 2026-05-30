<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();

            // ── Item reference ────────────────────────────────────────────────
            $table->foreignId('item_id')->nullable()->constrained('items')->nullOnDelete();
            $table->string('item_name', 255);                    // denormalized snapshot
            $table->foreignId('pricelist_id')->nullable()->constrained('price_lists')->nullOnDelete();

            // ── Pricing ───────────────────────────────────────────────────────
            $table->decimal('quantity', 15, 4)->default(1);
            $table->decimal('unit_price', 15, 4)->default(0);   // applied rate (after pricelist)
            $table->decimal('base_rate', 15, 4)->default(0);    // original rate before pricelist
            $table->decimal('gst_rate', 8, 4)->default(0);      // % snapshot
            $table->decimal('gst_amount', 15, 2)->default(0);   // qty × unit_price × gst_rate / 100
            $table->decimal('amount', 15, 2)->default(0);       // qty × unit_price

            // ── Display ───────────────────────────────────────────────────────
            $table->unsignedSmallInteger('sort_order')->default(0);

            $table->timestamps();

            $table->index('invoice_id');
            $table->index('item_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
    }
};
