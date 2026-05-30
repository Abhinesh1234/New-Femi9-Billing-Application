<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('inventory_adjustments', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number', 100)->nullable()->index();
            $table->date('adjustment_date');
            $table->unsignedBigInteger('reason_id')->nullable();
            $table->string('reason_name', 255);              // snapshot — preserved even if reason deleted
            $table->unsignedBigInteger('location_id');
            $table->unsignedBigInteger('party_id')->nullable(); // null = company stock
            $table->text('description')->nullable();
            $table->enum('status', ['draft', 'committed'])->default('committed');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('reason_id')->references('id')->on('inventory_adjustment_reasons')->nullOnDelete();
            $table->foreign('location_id')->references('id')->on('locations');
            $table->foreign('party_id')->references('id')->on('parties')->nullOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('updated_by')->references('id')->on('users')->nullOnDelete();

            $table->index('adjustment_date');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_adjustments');
    }
};
