<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('distribution_sub_categories', function (Blueprint $table) {
            $table->string('status', 20)->default('active')->after('description');
            $table->decimal('target_amount', 15, 2)->nullable()->after('status');
            $table->string('cashback_referral', 255)->nullable()->after('target_amount');
        });
    }

    public function down(): void
    {
        Schema::table('distribution_sub_categories', function (Blueprint $table) {
            $table->dropColumn(['status', 'target_amount', 'cashback_referral']);
        });
    }
};
