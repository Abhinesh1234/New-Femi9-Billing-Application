<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('party_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('party_id')->constrained('parties')->cascadeOnDelete();
            $table->enum('address_type', ['billing', 'shipping']);

            $table->string('attention', 100)->nullable();
            $table->foreignId('country_id')->nullable()->constrained('countries')->nullOnDelete();
            $table->string('street1', 255)->nullable();
            $table->string('street2', 255)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('pin_code', 20)->nullable();
            $table->string('phone_code', 15)->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('fax', 30)->nullable();

            $table->timestamps();

            // One billing + one shipping row per party
            $table->unique(['party_id', 'address_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('party_addresses');
    }
};
