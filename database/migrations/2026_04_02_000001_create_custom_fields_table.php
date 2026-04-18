<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_fields', function (Blueprint $table) {
            $table->id();
            $table->string('module', 50);
            $table->json('config');
            $table->timestamps();
            $table->softDeletes();

            $table->index('module');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_fields');
    }
};
