<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Replace the onDelete('cascade') on location_id FKs in item_stock and
     * item_stock_ledger with restrictOnDelete() so that deleting a location
     * fails loudly instead of silently wiping stock data.
     */
    public function up(): void
    {
        Schema::table('item_stock', function (Blueprint $table) {
            $table->dropForeign(['location_id']);
            $table->foreign('location_id')->references('id')->on('locations')->restrictOnDelete();
        });

        Schema::table('item_stock_ledger', function (Blueprint $table) {
            $table->dropForeign(['location_id']);
            $table->foreign('location_id')->references('id')->on('locations')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('item_stock', function (Blueprint $table) {
            $table->dropForeign(['location_id']);
            $table->foreign('location_id')->references('id')->on('locations')->onDelete('cascade');
        });

        Schema::table('item_stock_ledger', function (Blueprint $table) {
            $table->dropForeign(['location_id']);
            $table->foreign('location_id')->references('id')->on('locations')->onDelete('cascade');
        });
    }
};
