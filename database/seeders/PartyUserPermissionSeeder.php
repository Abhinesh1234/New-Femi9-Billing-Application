<?php

namespace Database\Seeders;

use App\Models\Party;
use App\Models\PartyUser;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PartyUserPermissionSeeder extends Seeder
{
    private const MODULES = [
        // Items
        ['module' => 'items',                  'can_view' => true, 'can_create' => true, 'can_edit' => true, 'can_delete' => true, 'can_others' => true],
        ['module' => 'composite_items',        'can_view' => true, 'can_create' => true, 'can_edit' => true, 'can_delete' => true, 'can_others' => true],
        ['module' => 'price_list',             'can_view' => true, 'can_create' => true, 'can_edit' => true, 'can_delete' => true, 'can_others' => true],
        // Inventory (inventory module only supports view)
        ['module' => 'inventory',              'can_view' => true, 'can_create' => false, 'can_edit' => false, 'can_delete' => false, 'can_others' => false],
        ['module' => 'assemblies',             'can_view' => true, 'can_create' => true, 'can_edit' => true, 'can_delete' => true, 'can_others' => true],
        ['module' => 'inventory_adjustments',  'can_view' => true, 'can_create' => true, 'can_edit' => true, 'can_delete' => true, 'can_others' => true],
        ['module' => 'transfer_orders',        'can_view' => true, 'can_create' => true, 'can_edit' => true, 'can_delete' => true, 'can_others' => true],
        // Sales
        ['module' => 'parties',                'can_view' => true, 'can_create' => true, 'can_edit' => true, 'can_delete' => true, 'can_others' => true],
        ['module' => 'invoices',               'can_view' => true, 'can_create' => true, 'can_edit' => true, 'can_delete' => true, 'can_others' => true],
        ['module' => 'payments',               'can_view' => true, 'can_create' => true, 'can_edit' => true, 'can_delete' => true, 'can_others' => true],
        ['module' => 'credit_notes',           'can_view' => true, 'can_create' => true, 'can_edit' => true, 'can_delete' => true, 'can_others' => true],
    ];

    public function run(): void
    {
        $this->assignRole('9952428768');
    }

    private function assignRole(string $mobile): void
    {
        $party = Party::where('mobile', $mobile)->first();

        if (! $party) {
            $this->command->warn("Party with mobile {$mobile} not found — skipping.");
            return;
        }

        $partyUser = PartyUser::where('party_id', $party->id)->first();

        if (! $partyUser) {
            $this->command->warn("No party_user found for party {$party->display_name} — skipping.");
            return;
        }

        $roleName = 'Items & Sales Full Access';
        $roleId   = DB::table('roles')->where('name', $roleName)->value('id');

        if (! $roleId) {
            $roleId = DB::table('roles')->insertGetId([
                'name'        => $roleName,
                'description' => 'Full access to all Items, Inventory, and Sales modules.',
                'is_system'   => false,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        DB::table('role_permissions')->where('role_id', $roleId)->delete();

        $now = now();
        DB::table('role_permissions')->insert(array_map(fn ($row) => array_merge($row, [
            'role_id'     => $roleId,
            'others_data' => null,
            'created_at'  => $now,
            'updated_at'  => $now,
        ]), self::MODULES));

        $partyUser->update(['role_id' => $roleId]);

        $this->command->info("Assigned role '{$roleName}' to {$partyUser->name} (Party: {$party->display_name}).");
    }
}
