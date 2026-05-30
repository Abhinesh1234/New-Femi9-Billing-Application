<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            // ── Identity ──────────────────────────────────────────────────────
            $table->string('payment_number', 50)->unique();     // e.g. PMT-000001
            $table->enum('status', ['open', 'closed'])->default('open');
            // open  = has unused_amount > 0 (advance / partially applied)
            // closed = fully applied to invoice(s)

            // ── Relations ─────────────────────────────────────────────────────
            $table->foreignId('customer_id')->constrained('parties')->restrictOnDelete();
            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->foreignId('series_id')->nullable()->constrained('transaction_series')->nullOnDelete();

            // ── Payment details ───────────────────────────────────────────────
            $table->date('payment_date');
            $table->decimal('amount', 15, 2);                   // total amount received
            $table->decimal('unused_amount', 15, 2);            // amount − sum of applications
            $table->enum('payment_mode', [
                'cash', 'cheque', 'bank_transfer', 'credit_card', 'upi',
            ])->default('cash');
            $table->string('reference_number', 100)->nullable(); // cheque no. / UTR / txn id

            // ── Notes ─────────────────────────────────────────────────────────
            $table->text('notes')->nullable();

            // ── Audit ─────────────────────────────────────────────────────────
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            // ── Indexes ───────────────────────────────────────────────────────
            $table->index('customer_id');
            $table->index('payment_date');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
