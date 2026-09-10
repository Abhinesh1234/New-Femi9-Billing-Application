<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    /**
     * NO-OP (resequenced for MySQL 8 / Aurora compatibility).
     *
     * This migration originally did:
     *     $table->boolean('can_approve')->default(false)->after('can_others');
     *     $table->boolean('can_export')->default(false)->after('can_approve');
     *
     * Those two operations were individually valid on MySQL 8 by the time this
     * migration runs, BUT the earlier migration 2026_05_26_105717 was written
     * to DROP `can_approve` and `can_export` — i.e. this cluster is a
     * half-finished refactor whose intended end state does NOT include these
     * columns.
     *
     * Evidence for the intended final schema (no can_approve / can_export):
     *   - App\Models\RolePermission $fillable / $casts list only:
     *       can_view, can_create, can_edit, can_delete, can_others, others_data
     *   - App\Models\UserPermission mirrors the same set; user_permissions
     *     table (2026_05_26_300002) is created with exactly that column set.
     *   - database/seeders/RoleSeeder + PartyUserPermissionSeeder insert only
     *     can_view/can_create/can_edit/can_delete/can_others/others_data.
     *   - No app, request, resource or seeder code anywhere reads or writes
     *     can_approve or can_export.
     *
     * So this migration is now intentionally a no-op, leaving the final
     * `role_permissions` schema as:
     *   id, role_id, module,
     *   can_view, can_create, can_edit, can_delete,
     *   can_others, others_data (json),
     *   created_at, updated_at,  UNIQUE(role_id, module)
     */
    public function up(): void
    {
        // no-op — see class docblock
    }

    public function down(): void
    {
        // no-op — see class docblock
    }
};
