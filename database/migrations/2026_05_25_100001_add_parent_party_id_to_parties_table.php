<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('parties', function (Blueprint $table) {
            $table->unsignedBigInteger('parent_party_id')
                  ->nullable()
                  ->after('distribution_sub_category_id');

            $table->foreign('parent_party_id', 'fk_parties_parent_party_id')
                  ->references('id')
                  ->on('parties')
                  ->nullOnDelete();

            $table->index('parent_party_id', 'idx_parties_parent_party_id');
        });
    }

    public function down(): void
    {
        Schema::table('parties', function (Blueprint $table) {
            $table->dropForeign('fk_parties_parent_party_id');
            $table->dropIndex('idx_parties_parent_party_id');
            $table->dropColumn('parent_party_id');
        });
    }
};
