<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserPermission;
use Illuminate\Database\Seeder;

class UserPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $this->syncFullAccess('9952428768');
    }

    private function syncFullAccess(string $phone): void
    {
        $user = User::where('phone', $phone)->first();

        if (! $user) {
            $this->command->warn("User with phone {$phone} not found — skipping.");
            return;
        }

        $modules = [
            ['module' => 'items',                  'can_view' => true,  'can_create' => true,  'can_edit' => true,  'can_delete' => true,  'can_others' => true],
            ['module' => 'composite_items',        'can_view' => true,  'can_create' => true,  'can_edit' => true,  'can_delete' => true,  'can_others' => true],
            ['module' => 'price_list',             'can_view' => true,  'can_create' => true,  'can_edit' => true,  'can_delete' => true,  'can_others' => true],
            ['module' => 'inventory',              'can_view' => true,  'can_create' => false, 'can_edit' => false, 'can_delete' => false, 'can_others' => false],
            ['module' => 'assemblies',             'can_view' => true,  'can_create' => true,  'can_edit' => true,  'can_delete' => true,  'can_others' => true],
            ['module' => 'inventory_adjustments',  'can_view' => true,  'can_create' => true,  'can_edit' => true,  'can_delete' => true,  'can_others' => true],
            ['module' => 'transfer_orders',        'can_view' => true,  'can_create' => true,  'can_edit' => true,  'can_delete' => true,  'can_others' => true],
            ['module' => 'parties',                'can_view' => true,  'can_create' => true,  'can_edit' => true,  'can_delete' => true,  'can_others' => true],
            ['module' => 'invoices',               'can_view' => true,  'can_create' => true,  'can_edit' => true,  'can_delete' => true,  'can_others' => true],
            ['module' => 'payments',               'can_view' => true,  'can_create' => true,  'can_edit' => true,  'can_delete' => true,  'can_others' => true],
            ['module' => 'credit_notes',           'can_view' => true,  'can_create' => true,  'can_edit' => true,  'can_delete' => true,  'can_others' => true],
            ['module' => 'distribution_locations', 'can_view' => true,  'can_create' => true,  'can_edit' => true,  'can_delete' => true,  'can_others' => true],
        ];

        UserPermission::where('user_id', $user->id)->delete();

        $now = now();
        UserPermission::insert(array_map(fn ($row) => array_merge($row, [
            'user_id'     => $user->id,
            'others_data' => null,
            'created_at'  => $now,
            'updated_at'  => $now,
        ]), $modules));

        $this->command->info("Set " . count($modules) . " permissions for {$user->name} (#{$user->id}).");
    }
}
