<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transaction_series', function (Blueprint $table) {
            // On a fresh database the FK, the composite unique index and the plain
            // index created by 2026_04_09_000002_create_transaction_series_table all
            // still exist and reference location_id. They must be dropped before the
            // column. Each drop is guarded so this is idempotent whether or not a
            // partial prior run already removed some of them.

            // 1. Foreign key (MySQL auto-name: transaction_series_location_id_foreign)
            $fkExists = collect(DB::select("
                SELECT CONSTRAINT_NAME
                FROM information_schema.TABLE_CONSTRAINTS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'transaction_series'
                  AND CONSTRAINT_NAME = 'transaction_series_location_id_foreign'
                  AND CONSTRAINT_TYPE = 'FOREIGN KEY'
            "))->isNotEmpty();
            if ($fkExists) {
                $table->dropForeign('transaction_series_location_id_foreign');
            }

            // 2. Composite unique index (location_id, is_default)
            if (collect(DB::select("SHOW INDEX FROM transaction_series WHERE Key_name = 'idx_txn_series_location_default'"))->isNotEmpty()) {
                $table->dropUnique('idx_txn_series_location_default');
            }

            // 3. Plain index on location_id
            if (collect(DB::select("SHOW INDEX FROM transaction_series WHERE Key_name = 'idx_txn_series_location'"))->isNotEmpty()) {
                $table->dropIndex('idx_txn_series_location');
            }

            // 4. Now the columns can be dropped
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
