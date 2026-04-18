<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('location_access', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('location_id');
            $table->unsignedBigInteger('user_id');
            $table->string('role', 50)->default('Staff');

            $table->timestamp('created_at')->useCurrent();

            $table->foreign('location_id')
                ->references('id')->on('locations')
                ->cascadeOnDelete();

            $table->foreign('user_id')
                ->references('id')->on('users')
                ->cascadeOnDelete();

            // Primary access check: does user X have access to location Y?
            // Also prevents duplicate rows.
            $table->unique(['location_id', 'user_id'], 'uq_location_user');

            // Reverse lookup: which locations can user X access?
            $table->index(['user_id', 'location_id'], 'idx_laccess_user');

            // Role-based queries: find all admins
            $table->index('role', 'idx_laccess_role');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('location_access');
    }
};
