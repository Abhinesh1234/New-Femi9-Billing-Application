<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_variants', function (Blueprint $table) {
            $table->id();

            $table->foreignId('item_id')
                ->constrained('items')->cascadeOnDelete();

            $table->string('combo_key', 255);        // e.g. "Red-L"
            $table->string('name', 255)->nullable();  // e.g. "Red / L"
            $table->string('sku', 100)->nullable();
            $table->decimal('cost_price', 15, 4)->nullable();
            $table->decimal('selling_price', 15, 4)->nullable();
            $table->string('image', 500)->nullable();
            $table->unsignedInteger('sort_order')->default(0);

            $table->timestamps();
            $table->softDeletes();

            // ── Indexes ───────────────────────────────────────────────────────
            $table->unique(['item_id', 'combo_key']);           // one combo per item
            $table->index(['item_id', 'sort_order']);           // ordered variant list
            $table->index('sku');                               // barcode / SKU lookup; uniqueness enforced at app layer
            $table->index(['selling_price', 'deleted_at']);     // price range queries
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_variants');
    }
};
