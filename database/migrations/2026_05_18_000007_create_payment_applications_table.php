<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_applications', function (Blueprint $table) {
            $table->id();

            // ── Links a payment to an invoice ─────────────────────────────────
            $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();

            $table->decimal('applied_amount', 15, 2);

            $table->timestamp('applied_at')->useCurrent();
            $table->foreignId('applied_by')->nullable()->constrained('users')->nullOnDelete();

            // A payment can only be applied once per invoice
            $table->unique(['payment_id', 'invoice_id']);

            $table->index('invoice_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_applications');
    }
};
