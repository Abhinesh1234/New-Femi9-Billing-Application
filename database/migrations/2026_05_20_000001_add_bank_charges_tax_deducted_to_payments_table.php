<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->decimal('bank_charges', 15, 2)->nullable()->default(null)->after('amount');
            $table->boolean('tax_deducted')->default(false)->after('bank_charges');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['bank_charges', 'tax_deducted']);
        });
    }
};
