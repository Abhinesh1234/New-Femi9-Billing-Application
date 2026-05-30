<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('party_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('party_id')->constrained('parties')->onDelete('cascade');
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('mobile')->nullable();
            $table->string('password');
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('party_id');
            $table->index('email');
            $table->index('mobile');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('party_users');
    }
};
