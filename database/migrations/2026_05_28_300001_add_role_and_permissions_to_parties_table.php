<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('parties', function (Blueprint $table) {
            $table->foreignId('role_id')
                ->nullable()
                ->constrained('roles')
                ->nullOnDelete()
                ->after('location_type');
            $table->json('permissions')->nullable()->after('role_id');
        });
    }

    public function down(): void
    {
        Schema::table('parties', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn(['role_id', 'permissions']);
        });
    }
};
