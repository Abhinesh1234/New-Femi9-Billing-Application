<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add the `others_data` JSON column to `role_permissions`.
     *
     * Resequenced for MySQL 8 / Aurora compatibility. This migration
     * originally also did:
     *
     *     $table->json('others_data')->nullable()->after('can_others');
     *     $table->dropColumn(['can_approve', 'can_export', 'party_category_ids']);
     *
     * Both were invalid on MySQL 8 on a fresh database:
     *   - `->after('can_others')`: `can_others` is only added by the LATER
     *     migration 2026_05_26_200001, so the anchor column did not exist.
     *   - `dropColumn([...])`: `can_approve` and `can_export` did not exist on
     *     `role_permissions` at this point (nothing had added them), so the
     *     drop referenced missing columns. `party_category_ids` is no longer
     *     created either (2026_05_26_104321 is now a no-op).
     *
     * SQLite silently tolerated all of that. The net intended effect of this
     * migration is simply: add `others_data`. It is appended (no `->after()`);
     * `can_others` is added afterwards by 2026_05_26_200001. Final column
     * order is cosmetic only.
     */
    public function up(): void
    {
        Schema::table('role_permissions', function (Blueprint $table) {
            if (! Schema::hasColumn('role_permissions', 'others_data')) {
                $table->json('others_data')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('role_permissions', function (Blueprint $table) {
            if (Schema::hasColumn('role_permissions', 'others_data')) {
                $table->dropColumn('others_data');
            }
        });
    }
};
