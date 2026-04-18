<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Migrate existing rows into JSON before dropping the table
        $rows = DB::table('location_access')->get();

        $grouped = [];
        foreach ($rows as $row) {
            $grouped[$row->location_id][] = [
                'user_id' => $row->user_id,
                'role'    => $row->role,
            ];
        }

        // Add JSON column to locations
        Schema::table('locations', function (Blueprint $table) {
            // [{user_id, role}, ...]  — null means no explicit access list set
            $table->json('access_users')->nullable()->after('is_active');
        });

        // Write migrated data
        foreach ($grouped as $locationId => $users) {
            DB::table('locations')
                ->where('id', $locationId)
                ->update(['access_users' => json_encode($users)]);
        }

        // CHECK: must be a JSON array when present
        DB::statement("
            ALTER TABLE locations
            ADD CONSTRAINT chk_access_users_array CHECK (
                access_users IS NULL OR JSON_TYPE(access_users) = 'ARRAY'
            )
        ");

        // Drop the now-redundant table
        Schema::dropIfExists('location_access');
    }

    public function down(): void
    {
        // Recreate location_access from JSON
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

            $table->unique(['location_id', 'user_id'], 'uq_location_user');
            $table->index(['user_id', 'location_id'], 'idx_laccess_user');
            $table->index('role', 'idx_laccess_role');
        });

        // Unpack JSON back into rows
        $locations = DB::table('locations')
            ->whereNotNull('access_users')
            ->get(['id', 'access_users']);

        foreach ($locations as $location) {
            $users = json_decode($location->access_users, true) ?? [];
            foreach ($users as $user) {
                DB::table('location_access')->insertOrIgnore([
                    'location_id' => $location->id,
                    'user_id'     => $user['user_id'],
                    'role'        => $user['role'] ?? 'Staff',
                    'created_at'  => now(),
                ]);
            }
        }

        Schema::table('locations', function (Blueprint $table) {
            $table->dropColumn('access_users');
        });
    }
};
