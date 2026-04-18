<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('items', function (Blueprint $table) {
            $table->id();

            // ── Core ──────────────────────────────────────────────────────────
            $table->string('name', 255);
            $table->enum('item_type', ['goods', 'service']);
            $table->enum('form_type', ['single', 'variants']);
            $table->string('unit', 50)->nullable();
            $table->string('sku', 100)->nullable();
            $table->text('description')->nullable();
            $table->string('image', 500)->nullable();

            // ── Relations ─────────────────────────────────────────────────────
            $table->foreignId('brand_id')
                ->nullable()->constrained('brands')->nullOnDelete();
            $table->foreignId('category_id')
                ->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('hsn_code_id')
                ->nullable()->constrained('hsn_codes')->nullOnDelete();
            $table->foreignId('gst_rate_id')
                ->nullable()->constrained('gst_rates')->nullOnDelete();

            // ── Associated tag ────────────────────────────────────────────────
            $table->string('product_tag', 100)->nullable();

            // ── Sales info ────────────────────────────────────────────────────
            $table->boolean('has_sales_info')->default(true);
            $table->decimal('selling_price', 15, 4)->nullable();
            $table->foreignId('sales_account_id')
                ->nullable()->constrained('accounts')->nullOnDelete();
            $table->text('sales_description')->nullable();

            // ── Purchase info ─────────────────────────────────────────────────
            $table->boolean('has_purchase_info')->default(true);
            $table->decimal('cost_price', 15, 4)->nullable();
            $table->foreignId('purchase_account_id')
                ->nullable()->constrained('accounts')->nullOnDelete();
            $table->text('purchase_description')->nullable();
            $table->string('preferred_vendor', 255)->nullable();

            // ── Inventory ─────────────────────────────────────────────────────
            $table->boolean('track_inventory')->default(true);
            $table->foreignId('inventory_account_id')
                ->nullable()->constrained('accounts')->nullOnDelete();
            $table->enum('valuation_method', ['fifo', 'average'])->nullable();
            $table->unsignedInteger('reorder_point')->nullable();

            // ── Fulfilment (goods only) ───────────────────────────────────────
            $table->boolean('is_returnable')->default(true);
            $table->json('dimensions')->nullable();  // {length, width, height, unit}
            $table->json('weight')->nullable();       // {value, unit}

            // ── Identifiers (single mode only) ────────────────────────────────
            $table->json('identifiers')->nullable();  // {upc, mpn, ean, isbn}

            // ── Variations config (variants mode) — replaces 2 tables ─────────
            $table->json('variation_config')->nullable(); // [{attribute, options[]}]

            // ── Custom fields ─────────────────────────────────────────────────
            $table->json('custom_fields')->nullable();    // {field_key: value}

            $table->timestamps();
            $table->softDeletes();

            // ── Indexes ───────────────────────────────────────────────────────
            $table->index('name');
            $table->index(['item_type', 'deleted_at']);
            $table->index(['form_type', 'deleted_at']);
            $table->index(['selling_price', 'deleted_at']);
            $table->index(['cost_price', 'deleted_at']);
            $table->index('sku');        // fast SKU lookup; uniqueness enforced at app layer
            $table->index('brand_id');
            $table->index('category_id');
            $table->index('hsn_code_id');
            $table->index('gst_rate_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
