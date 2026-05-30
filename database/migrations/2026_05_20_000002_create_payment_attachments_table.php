<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->string('original_name', 255);
            $table->string('storage_path', 500);
            $table->unsignedInteger('file_size');
            $table->string('mime_type', 100);
            $table->timestamps();

            $table->index('payment_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_attachments');
    }
};
