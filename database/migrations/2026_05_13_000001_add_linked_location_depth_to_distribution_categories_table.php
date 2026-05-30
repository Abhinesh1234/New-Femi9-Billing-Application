<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('distribution_categories', function (Blueprint $table) {
            $table->unsignedTinyInteger('linked_location_depth')->nullable()->after('linked_location_node_id');
        });
    }

    public function down(): void
    {
        Schema::table('distribution_categories', function (Blueprint $table) {
            $table->dropColumn('linked_location_depth');
        });
    }
};
