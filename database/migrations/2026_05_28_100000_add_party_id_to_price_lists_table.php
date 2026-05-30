<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('price_lists', function (Blueprint $table) {
            $table->unsignedBigInteger('party_id')->nullable()->after('created_by');
            $table->foreign('party_id')->references('id')->on('parties')->nullOnDelete();
            $table->index('party_id', 'idx_pl_party_id');
        });
    }

    public function down(): void
    {
        Schema::table('price_lists', function (Blueprint $table) {
            $table->dropForeign(['party_id']);
            $table->dropIndex('idx_pl_party_id');
            $table->dropColumn('party_id');
        });
    }
};
