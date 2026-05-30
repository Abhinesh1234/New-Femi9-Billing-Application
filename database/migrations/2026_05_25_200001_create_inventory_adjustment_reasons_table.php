<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('inventory_adjustment_reasons', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255)->unique();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
        });

        // Seed default reasons
        $now = now();
        DB::table('inventory_adjustment_reasons')->insert([
            ['name' => 'Shrinkage / Spoilage',     'sort_order' => 1, 'created_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Theft / Loss',             'sort_order' => 2, 'created_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Damage',                   'sort_order' => 3, 'created_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Stock Count Correction',   'sort_order' => 4, 'created_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Production Use',           'sort_order' => 5, 'created_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Other',                    'sort_order' => 6, 'created_by' => null, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_adjustment_reasons');
    }
};
