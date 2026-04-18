<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaction_series_modules', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('series_id');

            // Full module config stored as a JSON array.
            // Each element: {
            //   module, prefix, starting_number,
            //   current_number, restart_numbering, last_reset_at
            // }
            $table->json('modules');

            $table->timestamps();

            $table->foreign('series_id')
                ->references('id')->on('transaction_series')
                ->cascadeOnDelete();

            // One modules-row per series — enforced at DB level
            $table->unique('series_id', 'idx_tsm_series_unique');
        });

        // Validate JSON is a non-empty array
        DB::statement("
            ALTER TABLE transaction_series_modules
            ADD CONSTRAINT chk_modules_is_array CHECK (
                JSON_TYPE(modules) = 'ARRAY'
                AND JSON_LENGTH(modules) > 0
            )
        ");
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_series_modules');
    }
};
