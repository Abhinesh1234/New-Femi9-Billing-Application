<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('distribution_sub_categories', function (Blueprint $table) {
            $table->unsignedBigInteger('distribution_category_id')->nullable()->after('name');

            $table->foreign('distribution_category_id')
                  ->references('id')
                  ->on('distribution_categories')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('distribution_sub_categories', function (Blueprint $table) {
            $table->dropForeign(['distribution_category_id']);
            $table->dropColumn('distribution_category_id');
        });
    }
};
