<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transaction_series', function (Blueprint $table) {
            $table->string('customer_category')->nullable()->after('name');
            $table->boolean('is_system_default')->default(false)->after('customer_category');
        });

        // Seed only if no system default already exists
        if (DB::table('transaction_series')->where('is_system_default', true)->doesntExist()) {
            $now = now();

            $seriesId = DB::table('transaction_series')->insertGetId([
                'name'              => 'Default Transaction Series',
                'customer_category' => null,
                'is_system_default' => true,
                'created_at'        => $now,
                'updated_at'        => $now,
            ]);

            $defaultModules = [
                ['module' => 'Credit Note',      'prefix' => 'CN-',   'starting_number' => '00001',  'current_number' => 1, 'last_reset_at' => null, 'restart_numbering' => 'None'],
                ['module' => 'Customer Payment', 'prefix' => '',      'starting_number' => '1',      'current_number' => 1, 'last_reset_at' => null, 'restart_numbering' => 'None'],
                ['module' => 'Purchase Order',   'prefix' => 'PO-',   'starting_number' => '00001',  'current_number' => 1, 'last_reset_at' => null, 'restart_numbering' => 'None'],
                ['module' => 'Sales Order',      'prefix' => 'SO-',   'starting_number' => '00001',  'current_number' => 1, 'last_reset_at' => null, 'restart_numbering' => 'None'],
                ['module' => 'Vendor Payment',   'prefix' => '',      'starting_number' => '1',      'current_number' => 1, 'last_reset_at' => null, 'restart_numbering' => 'None'],
                ['module' => 'Retainer Invoice', 'prefix' => 'RET-',  'starting_number' => '00001',  'current_number' => 1, 'last_reset_at' => null, 'restart_numbering' => 'None'],
                ['module' => 'Bill Of Supply',   'prefix' => 'BOS-',  'starting_number' => '000001', 'current_number' => 1, 'last_reset_at' => null, 'restart_numbering' => 'None'],
                ['module' => 'Invoice',          'prefix' => 'INV-',  'starting_number' => '000001', 'current_number' => 1, 'last_reset_at' => null, 'restart_numbering' => 'None'],
                ['module' => 'Sales Return',     'prefix' => 'RMA-',  'starting_number' => '00001',  'current_number' => 1, 'last_reset_at' => null, 'restart_numbering' => 'None'],
                ['module' => 'Delivery Challan', 'prefix' => 'DC-',   'starting_number' => '00001',  'current_number' => 1, 'last_reset_at' => null, 'restart_numbering' => 'None'],
            ];

            DB::table('transaction_series_modules')->insert([
                'series_id'  => $seriesId,
                'modules'    => json_encode($defaultModules),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        DB::table('transaction_series_modules')
            ->whereIn('series_id',
                DB::table('transaction_series')->where('is_system_default', true)->pluck('id')
            )->delete();

        DB::table('transaction_series')->where('is_system_default', true)->delete();

        Schema::table('transaction_series', function (Blueprint $table) {
            $table->dropColumn(['is_system_default', 'customer_category']);
        });
    }
};
