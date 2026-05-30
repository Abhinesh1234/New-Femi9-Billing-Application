<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('customer_categories') && !Schema::hasTable('distribution_categories')) {
            Schema::rename('customer_categories', 'distribution_categories');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('distribution_categories') && !Schema::hasTable('customer_categories')) {
            Schema::rename('distribution_categories', 'customer_categories');
        }
    }
};
