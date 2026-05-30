<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('party_id_sequences', function (Blueprint $table) {
            $table->id();

            // e.g. "DIST_B", "RETAIL_B", "CUS_F"
            $table->string('sequence_key', 60)->unique();

            // The prefix that appears in the generated ID, e.g. "DIST", "CUS-F"
            $table->string('prefix', 30);

            $table->unsignedInteger('last_number')->default(0);

            // How many digits to zero-pad the sequence, default 4 → "0001"
            $table->unsignedTinyInteger('pad_length')->default(4);

            $table->timestamp('updated_at')->nullable();
        });

        // Seed the fixed individual sequence up-front.
        // Business sequences are seeded on first party save per category.
        DB::table('party_id_sequences')->insert([
            'sequence_key' => 'CUS_F',
            'prefix'       => 'CUS-F',
            'last_number'  => 0,
            'pad_length'   => 4,
            'updated_at'   => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('party_id_sequences');
    }
};
