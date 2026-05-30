<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credit_applications', function (Blueprint $table) {
            $table->id();

            $table->foreignId('customer_credit_id')->constrained('customer_credits')->cascadeOnDelete();
            $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();

            $table->decimal('applied_amount', 15, 2);

            $table->timestamp('applied_at')->useCurrent();
            $table->foreignId('applied_by')->nullable()->constrained('users')->nullOnDelete();

            // A credit can only be applied once per invoice
            $table->unique(['customer_credit_id', 'invoice_id']);

            $table->index('invoice_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_applications');
    }
};
