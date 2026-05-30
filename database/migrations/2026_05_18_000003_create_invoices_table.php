<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();

            // ── Identity ──────────────────────────────────────────────────────
            $table->string('invoice_number', 50)->unique();
            $table->enum('status', ['draft', 'sent', 'paid', 'partially_paid', 'overdue', 'void'])
                  ->default('draft');

            // ── Relations ─────────────────────────────────────────────────────
            $table->foreignId('customer_id')->constrained('parties')->restrictOnDelete();
            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->foreignId('series_id')->nullable()->constrained('transaction_series')->nullOnDelete();
            $table->foreignId('reference_id')->nullable()->constrained('invoice_references')->nullOnDelete();
            $table->foreignId('pricelist_id')->nullable()->constrained('price_lists')->nullOnDelete();

            // ── Header fields ─────────────────────────────────────────────────
            $table->string('order_number', 100)->nullable();
            $table->date('invoice_date');
            $table->enum('payment_terms', [
                'due_on_receipt', 'net_15', 'net_30', 'net_45', 'net_60', 'net_90', 'custom',
            ])->default('due_on_receipt');
            $table->date('due_date')->nullable();
            $table->string('salesperson', 100)->nullable();

            // ── Pricing ───────────────────────────────────────────────────────
            $table->decimal('sub_total', 15, 2)->default(0);

            $table->enum('discount_type', ['amount', 'percent'])->default('amount');
            $table->decimal('discount_value', 15, 4)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);  // resolved ₹ amount

            $table->enum('tax_type', ['tds', 'tcs'])->nullable();
            $table->foreignId('tax_id')->nullable()->constrained('taxes')->nullOnDelete();
            $table->decimal('tax_rate', 8, 4)->nullable();           // snapshot at invoice time
            $table->decimal('tax_amount', 15, 2)->default(0);

            // ── Charges (merged from invoice_charges) ─────────────────────────
            //
            // Stored as JSON — charges are always loaded with the invoice and
            // never queried independently across invoices.
            //   [ { "label": "Courier Charge", "amount": 50.00 }, ... ]
            //
            $table->json('charges_json')->nullable();
            $table->decimal('total_charges', 15, 2)->default(0);    // sum of charges_json amounts

            $table->decimal('grand_total', 15, 2)->default(0);       // sub_total − discount + charges ± tax

            // ── Payment tracking (cached — updated when payments are applied) ─
            $table->decimal('total_paid', 15, 2)->default(0);
            $table->decimal('balance_amount', 15, 2)->default(0);

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
            $table->index('invoice_date');
            $table->index('status');
            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
