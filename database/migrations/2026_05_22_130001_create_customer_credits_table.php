<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_credits', function (Blueprint $table) {
            $table->id();

            $table->foreignId('customer_id')->constrained('parties')->restrictOnDelete();
            $table->foreignId('credit_note_id')->constrained('credit_notes')->cascadeOnDelete();

            $table->decimal('amount', 15, 2);         // full credit note value
            $table->decimal('unused_amount', 15, 2);  // remaining unapplied

            // open = has unused_amount > 0, closed = fully applied
            $table->enum('status', ['open', 'closed'])->default('open');

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('customer_id');
            $table->index('credit_note_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_credits');
    }
};
