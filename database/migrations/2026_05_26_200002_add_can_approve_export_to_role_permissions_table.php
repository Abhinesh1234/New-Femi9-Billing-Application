<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('role_permissions', function (Blueprint $table) {
            $table->boolean('can_approve')->default(false)->after('can_others');
            $table->boolean('can_export')->default(false)->after('can_approve');
        });
    }

    public function down(): void
    {
        Schema::table('role_permissions', function (Blueprint $table) {
            $table->dropColumn(['can_approve', 'can_export']);
        });
    }
};
