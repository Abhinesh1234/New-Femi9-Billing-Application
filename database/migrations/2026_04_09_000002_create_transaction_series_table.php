<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaction_series', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('location_id');
            $table->string('name', 255);
            $table->boolean('is_default')->default(false);

            $table->timestamps();

            $table->foreign('location_id')
                ->references('id')->on('locations')
                ->cascadeOnDelete();

            // All series for a location
            $table->index('location_id', 'idx_txn_series_location');

            // Covering unique: enforces one default per location at DB level
            // and serves "WHERE location_id = ? AND is_default = 1" in one seek
            $table->unique(['location_id', 'is_default'], 'idx_txn_series_location_default');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_series');
    }
};
