<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('distribution_categories', function (Blueprint $table) {
            $table->string('party_type', 50)->nullable()->after('visible_in_hierarchy');
            $table->boolean('is_system')->default(false)->after('party_type');
        });

        // Seed system categories
        $now = now();
        DB::table('distribution_categories')->insert([
            [
                'name'                => 'Customer',
                'code'                => 'CUSTOMER',
                'description'         => 'System category for individual customers',
                'parent_id'           => null,
                'level'               => 1,
                'portal_access'       => false,
                'visible_in_hierarchy'=> true,
                'party_type'          => 'individual',
                'is_system'           => true,
                'created_at'          => $now,
                'updated_at'          => $now,
            ],
            [
                'name'                => 'Shop',
                'code'                => 'SHOP',
                'description'         => 'System category for individual shops',
                'parent_id'           => null,
                'level'               => 1,
                'portal_access'       => false,
                'visible_in_hierarchy'=> true,
                'party_type'          => 'individual',
                'is_system'           => true,
                'created_at'          => $now,
                'updated_at'          => $now,
            ],
        ]);
    }

    public function down(): void
    {
        DB::table('distribution_categories')
            ->where('is_system', true)
            ->whereIn('code', ['CUSTOMER', 'SHOP'])
            ->delete();

        Schema::table('distribution_categories', function (Blueprint $table) {
            $table->dropColumn(['party_type', 'is_system']);
        });
    }
};
