<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    private const MODULES = [
        'items',
        'composite_items',
        'price_list',
        'inventory',
        'assemblies',
        'inventory_adjustments',
        'transfer_orders',
        'parties',
        'invoices',
        'payments',
        'credit_notes',
        'distribution_locations',
    ];

    public function run(): void
    {
        $roleId = DB::table('roles')->insertGetId([
            'name'        => 'Super Admin',
            'description' => 'Full access to all modules.',
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        $permissions = array_map(fn (string $module) => [
            'role_id'    => $roleId,
            'module'     => $module,
            'can_view'   => true,
            'can_create' => true,
            'can_edit'   => true,
            'can_delete' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ], self::MODULES);

        DB::table('role_permissions')->insert($permissions);
    }
}
