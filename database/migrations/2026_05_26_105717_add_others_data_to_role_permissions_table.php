<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('role_permissions', function (Blueprint $table) {
            $table->json('others_data')->nullable()->after('can_others');
            $table->dropColumn(['can_approve', 'can_export', 'party_category_ids']);
        });
    }

    public function down(): void
    {
        Schema::table('role_permissions', function (Blueprint $table) {
            $table->dropColumn('others_data');
            $table->boolean('can_approve')->default(false)->after('can_others');
            $table->boolean('can_export')->default(false)->after('can_approve');
            $table->json('party_category_ids')->nullable()->after('can_export');
        });
    }
};
