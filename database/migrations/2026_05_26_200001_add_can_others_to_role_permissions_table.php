<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Add `can_others` to `role_permissions`.
     *
     * `can_delete` exists (created by 2026_05_26_100002), so the
     * `->after('can_delete')` anchor is valid on MySQL 8. Guarded with
     * hasColumn so a partial prior run does not cause a duplicate-column error.
     */
    public function up(): void
    {
        Schema::table('role_permissions', function (Blueprint $table) {
            if (! Schema::hasColumn('role_permissions', 'can_others')) {
                $table->boolean('can_others')->default(false)->after('can_delete');
            }
        });
    }

    public function down(): void
    {
        Schema::table('role_permissions', function (Blueprint $table) {
            if (Schema::hasColumn('role_permissions', 'can_others')) {
                $table->dropColumn('can_others');
            }
        });
    }
};
