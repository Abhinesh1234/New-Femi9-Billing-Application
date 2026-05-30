<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->unsignedBigInteger('party_user_id')
                ->nullable()
                ->after('user_id');

            $table->foreign('party_user_id')
                ->references('id')->on('party_users')
                ->nullOnDelete();

            $table->index('party_user_id', 'audit_logs_party_user_index');
        });
    }

    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropForeign(['party_user_id']);
            $table->dropIndex('audit_logs_party_user_index');
            $table->dropColumn('party_user_id');
        });
    }
};
