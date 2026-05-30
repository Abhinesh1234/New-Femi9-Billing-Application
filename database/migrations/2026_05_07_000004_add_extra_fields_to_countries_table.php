<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('countries', function (Blueprint $table) {
            $table->string('phone_code',      10)->nullable()->after('code');
            $table->string('currency_code',   10)->nullable()->after('phone_code');
            $table->string('currency_symbol', 10)->nullable()->after('currency_code');
            $table->unsignedTinyInteger('phone_digits')->nullable()->after('currency_symbol');
        });
    }

    public function down(): void
    {
        Schema::table('countries', function (Blueprint $table) {
            $table->dropColumn(['phone_code', 'currency_code', 'currency_symbol', 'phone_digits']);
        });
    }
};
