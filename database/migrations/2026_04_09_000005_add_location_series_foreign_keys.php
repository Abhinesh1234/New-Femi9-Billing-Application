<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // These FKs could not be added in the locations migration because
        // transaction_series did not exist yet.
        Schema::table('locations', function (Blueprint $table) {
            $table->foreign('txn_series_id', 'fk_locations_txn_series')
                ->references('id')->on('transaction_series')
                ->nullOnDelete();

            $table->foreign('default_txn_series_id', 'fk_locations_default_txn_series')
                ->references('id')->on('transaction_series')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropForeign('fk_locations_txn_series');
            $table->dropForeign('fk_locations_default_txn_series');
        });
    }
};
