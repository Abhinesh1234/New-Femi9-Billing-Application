<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * price_lists
     * ----------
     * Stores the top-level price list record.
     *
     * settings (JSON) holds type-specific configuration so we avoid a handful
     * of nullable columns that only apply to one price_list_type:
     *
     *   all_items      → { "adjustment_method": "markup", "percentage": 10.00,
     *                       "round_off": "Nearest whole number" }
     *
     *   individual_items → { "pricing_scheme": "unit",
     *                        "currency": "INR - Indian Rupee",
     *                        "include_discount": true }
     */
    public function up(): void
    {
        Schema::create('price_lists', function (Blueprint $table) {

            // ── Primary key ───────────────────────────────────────────────
            $table->id();

            // ── Core fields ───────────────────────────────────────────────
            $table->string('name', 255);

            $table->enum('transaction_type', ['sales', 'purchase', 'both'])
                  ->default('sales');

            // FK to customer_categories (assumed to exist)
            $table->unsignedBigInteger('customer_category_id')->nullable();

            $table->enum('price_list_type', ['all_items', 'individual_items'])
                  ->default('all_items');

            $table->text('description')->nullable();

            // Type-specific config stored as JSON — see docblock above
            $table->json('settings')->nullable();

            // ── Status / audit ────────────────────────────────────────────
            $table->boolean('is_active')->default(true);

            $table->unsignedBigInteger('created_by')->nullable();

            $table->timestamps();

            // Soft deletes — keep historical records when a list is removed
            $table->softDeletes();

            // ── Indexes ───────────────────────────────────────────────────

            // FK lookups
            // Note: customer_categories FK will be added in a separate migration
            // once that table is created.

            $table->foreign('created_by')
                  ->references('id')->on('users')
                  ->nullOnDelete();

            // Single-column indexes for filtering / sorting
            $table->index('transaction_type',    'idx_pl_transaction_type');
            $table->index('price_list_type',     'idx_pl_price_list_type');
            $table->index('customer_category_id','idx_pl_customer_category');
            $table->index('deleted_at',          'idx_pl_deleted_at');

            // Composite: most common read query —
            // "give me all active price lists for this transaction type"
            $table->index(['is_active', 'transaction_type'], 'idx_pl_active_txn');

            // Composite: "active lists applicable to this customer category"
            $table->index(['is_active', 'customer_category_id'], 'idx_pl_active_category');

            // Composite: useful when the UI filters by type + active state
            $table->index(['price_list_type', 'is_active'], 'idx_pl_type_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('price_lists');
    }
};
