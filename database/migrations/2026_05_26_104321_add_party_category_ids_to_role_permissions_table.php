<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * NO-OP (resequenced for MySQL 8 / Aurora compatibility).
     *
     * This migration originally did:
     *     $table->json('party_category_ids')->nullable()->after('can_export');
     *
     * That was invalid on MySQL 8 in two ways:
     *   1. `can_export` did not exist on `role_permissions` at this point
     *      (it is only added — much later — by 2026_05_26_200002), so the
     *      `->after('can_export')` anchor referenced a missing column.
     *   2. The very next migration (2026_05_26_105717) immediately dropped
     *      `party_category_ids` again, so this column was transient and is
     *      NOT part of the intended final schema.
     *
     * The intended final `role_permissions` schema (derived from
     * App\Models\RolePermission $fillable/$casts, RoleSeeder,
     * PartyUserPermissionSeeder and all app code) is:
     *
     *     id, role_id, module,
     *     can_view, can_create, can_edit, can_delete,
     *     can_others, others_data (json),
     *     created_at, updated_at,  UNIQUE(role_id, module)
     *
     * Per-party-category scoping is stored as a nested key inside the
     * `others_data` JSON column (others_data->party_category_ids), never as a
     * standalone column. So this migration is now intentionally a no-op; the
     * `others_data` column is added by 2026_05_26_105717.
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
