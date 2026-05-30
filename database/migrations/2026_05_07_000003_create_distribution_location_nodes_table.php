<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('distribution_location_nodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->constrained('countries')->onDelete('cascade');
            $table->foreignId('parent_id')
                  ->nullable()
                  ->constrained('distribution_location_nodes')
                  ->onDelete('cascade');
            $table->unsignedTinyInteger('depth'); // 1 = first layer, 2 = second, etc.
            $table->string('name', 150);
            $table->string('code', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('country_id');
            $table->index('parent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('distribution_location_nodes');
    }
};
