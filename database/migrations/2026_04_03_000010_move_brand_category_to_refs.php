<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropForeign(['brand_id']);
            $table->dropForeign(['category_id']);
            $table->dropIndex('items_brand_id_index');
            $table->dropIndex('items_category_id_index');
            $table->dropColumn(['brand_id', 'category_id']);
        });
    }

    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->foreignId('brand_id')->nullable()->constrained('brands')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->index('brand_id');
            $table->index('category_id');
        });
    }
};
