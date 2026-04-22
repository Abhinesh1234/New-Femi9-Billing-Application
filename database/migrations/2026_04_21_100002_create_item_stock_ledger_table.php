<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_stock_ledger', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('item_id');
            $table->unsignedBigInteger('location_id');
            $table->enum('transaction_type', [
                'opening',
                'purchase',
                'sale',
                'sale_return',
                'purchase_return',
                'transfer_in',
                'transfer_out',
                'adjustment',
                'commit',
                'uncommit',
            ]);
            $table->date('transaction_date');
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->decimal('qty_change', 15, 4)->default(0);
            $table->decimal('committed_change', 15, 4)->default(0);
            $table->decimal('unit_value', 15, 4)->nullable();
            $table->decimal('stock_on_hand_after', 15, 4)->default(0);
            $table->decimal('committed_after', 15, 4)->default(0);
            $table->decimal('available_after', 15, 4)->default(0);
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('item_id')->references('id')->on('items')->onDelete('cascade');
            $table->foreign('location_id')->references('id')->on('locations')->onDelete('cascade');
            $table->index(['item_id', 'location_id', 'transaction_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_stock_ledger');
    }
};
