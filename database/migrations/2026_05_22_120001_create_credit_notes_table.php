<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credit_notes', function (Blueprint $table) {
            $table->id();

            // ── Identity ──────────────────────────────────────────────────────
            $table->string('credit_note_number', 50)->unique();
            $table->enum('status', ['draft', 'issued', 'void'])->default('issued');

            // ── Relations ─────────────────────────────────────────────────────
            $table->foreignId('customer_id')->constrained('parties')->restrictOnDelete();
            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->foreignId('series_id')->nullable()->constrained('transaction_series')->nullOnDelete();
            $table->foreignId('source_invoice_id')->nullable()->constrained('invoices')->nullOnDelete();
            $table->foreignId('reference_id')->nullable()->constrained('invoice_references')->nullOnDelete();
            $table->foreignId('pricelist_id')->nullable()->constrained('price_lists')->nullOnDelete();

            // ── Header fields ─────────────────────────────────────────────────
            $table->string('order_number', 100)->nullable();
            $table->date('credit_note_date');
            $table->string('salesperson', 100)->nullable();

            // ── Pricing ───────────────────────────────────────────────────────
            $table->decimal('sub_total', 15, 2)->default(0);

            $table->enum('discount_type', ['amount', 'percent'])->default('amount');
            $table->decimal('discount_value', 15, 4)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);

            $table->enum('tax_type', ['tds', 'tcs'])->nullable();
            $table->foreignId('tax_id')->nullable()->constrained('taxes')->nullOnDelete();
            $table->decimal('tax_rate', 8, 4)->nullable();
            $table->decimal('tax_amount', 15, 2)->default(0);

            $table->json('charges_json')->nullable();
            $table->decimal('total_charges', 15, 2)->default(0);

            $table->decimal('grand_total', 15, 2)->default(0);

            // ── Notes ─────────────────────────────────────────────────────────
            $table->text('customer_notes')->nullable();
            $table->text('terms_conditions')->nullable();

            // ── Audit ─────────────────────────────────────────────────────────
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            // ── Indexes ───────────────────────────────────────────────────────
            $table->index('customer_id');
            $table->index('credit_note_date');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_notes');
    }
};
