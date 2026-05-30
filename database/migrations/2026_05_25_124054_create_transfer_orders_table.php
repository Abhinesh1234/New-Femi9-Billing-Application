<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transfer_orders', function (Blueprint $table) {
            $table->id();
            $table->string('transfer_number', 100)->unique();
            $table->date('transfer_date');
            $table->foreignId('source_location_id')->constrained('locations');
            $table->foreignId('destination_location_id')->constrained('locations');
            $table->text('reason')->nullable();
            $table->enum('status', ['draft', 'in_transit', 'received', 'cancelled'])->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transfer_orders');
    }
};
