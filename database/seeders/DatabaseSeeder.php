<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Super Admin
        User::updateOrCreate(
            ['phone' => '9999999999'],
            [
                'name'      => 'Super Admin',
                'phone'     => '9999999999',
                'email'     => 'admin@femi9.com',
                'password'  => 'Admin@1234',
                'user_type' => 'super_admin',
                'is_active' => true,
            ]
        );

        // Jayadeepa
        User::updateOrCreate(
            ['phone' => '9876543218'],
            [
                'name'      => 'Jayadeepa',
                'phone'     => '9876543218',
                'email'     => 'jayadeepa@femi9.com',
                'password'  => 'Jaya@8374',
                'user_type' => 'admin',
                'is_active' => true,
            ]
        );

        // Vijay
        User::updateOrCreate(
            ['phone' => '9845671253'],
            [
                'name'      => 'Vijay',
                'phone'     => '9845671253',
                'email'     => 'vijay@femi9.com',
                'password'  => 'Vijay@6291',
                'user_type' => 'admin',
                'is_active' => true,
            ]
        );

        $this->call([
            ProductCustomFieldSeeder::class,
        ]);
    }
}
