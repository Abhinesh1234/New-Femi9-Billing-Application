<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // ── Identity ──────────────────────────────────────────────────────
            $table->string('phone', 20)->unique()->after('id');
            $table->string('avatar', 500)->nullable()->after('phone');

            // ── Role & status ─────────────────────────────────────────────────
            // super_admin : full system access, can manage other admins
            // admin       : manages locations, items, billing
            // staff       : limited access per location permissions
            $table->enum('user_type', ['super_admin', 'admin', 'staff'])
                ->default('staff')
                ->after('avatar');

            $table->boolean('is_active')->default(true)->after('user_type');

            // ── Permissions (JSON) ────────────────────────────────────────────
            // Granular permission overrides per user (on top of role defaults).
            // Structure: { "module": { "view": true, "create": true, "edit": false, "delete": false } }
            $table->json('permissions')->nullable()->after('is_active');

            // ── Soft delete ───────────────────────────────────────────────────
            $table->softDeletes()->after('remember_token');

            // make email nullable (phone is primary identifier)
            $table->string('email')->nullable()->change();
        });

        // ── Indexes ───────────────────────────────────────────────────────────
        DB::statement('CREATE INDEX idx_users_phone       ON users (phone)');
        DB::statement('CREATE INDEX idx_users_user_type   ON users (user_type)');
        DB::statement('CREATE INDEX idx_users_is_active   ON users (is_active)');
        DB::statement('CREATE INDEX idx_users_type_active ON users (user_type, is_active)');
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'avatar', 'user_type', 'is_active', 'permissions', 'deleted_at']);
            $table->string('email')->nullable(false)->change();
        });
    }
};
