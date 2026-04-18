<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->boolean('is_composite')->default(false)->after('form_type');
            $table->enum('composite_type', ['assembly', 'kit'])->nullable()->after('is_composite');
        });
    }

    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropColumn(['is_composite', 'composite_type']);
        });
    }
};
