<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('distribution_sub_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('code', 50)->nullable();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->unsignedTinyInteger('level')->default(1);
            $table->unsignedBigInteger('linked_location_country_id')->nullable();
            $table->unsignedBigInteger('linked_location_node_id')->nullable();
            $table->boolean('portal_access')->default(false);
            $table->boolean('visible_in_hierarchy')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('parent_id')
                  ->references('id')
                  ->on('distribution_sub_categories')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('distribution_sub_categories');
    }
};
