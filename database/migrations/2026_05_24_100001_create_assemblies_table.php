<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assemblies', function (Blueprint $table) {
            $table->id();
            $table->string('assembly_number')->unique();
            $table->unsignedBigInteger('composite_item_id');
            $table->unsignedBigInteger('location_id');
            $table->date('assembled_date');
            $table->decimal('quantity_to_assemble', 15, 4);
            $table->text('description')->nullable();
            $table->enum('status', ['completed', 'cancelled'])->default('completed');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('cancelled_by')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('composite_item_id')->references('id')->on('items');
            $table->foreign('location_id')->references('id')->on('locations');
            $table->index(['composite_item_id', 'location_id']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assemblies');
    }
};
