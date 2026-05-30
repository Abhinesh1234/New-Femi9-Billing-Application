<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('distribution_categories', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->after('visible_in_hierarchy')
                  ->constrained('roles')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('distribution_categories', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\Role::class, 'role_id');
            $table->dropColumn('role_id');
        });
    }
};
