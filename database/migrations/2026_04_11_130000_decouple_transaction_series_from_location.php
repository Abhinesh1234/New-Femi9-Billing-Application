<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transaction_series', function (Blueprint $table) {
            // FK and unique index were already removed in a prior partial attempt;
            // only the plain index remains now.
            if (collect(DB::select("SHOW INDEX FROM transaction_series WHERE Key_name = 'idx_txn_series_location'"))->isNotEmpty()) {
                $table->dropIndex('idx_txn_series_location');
            }

            $columns = collect(DB::select("SHOW COLUMNS FROM transaction_series"))->pluck('Field');
            if ($columns->contains('location_id')) $table->dropColumn('location_id');
            if ($columns->contains('is_default'))  $table->dropColumn('is_default');
        });
    }

    public function down(): void
    {
        Schema::table('transaction_series', function (Blueprint $table) {
            $table->unsignedBigInteger('location_id')->after('id');
            $table->boolean('is_default')->default(false)->after('name');

            $table->foreign('location_id')
                ->references('id')->on('locations')
                ->cascadeOnDelete();

            $table->index('location_id', 'idx_txn_series_location');
            $table->unique(['location_id', 'is_default'], 'idx_txn_series_location_default');
        });
    }
};
