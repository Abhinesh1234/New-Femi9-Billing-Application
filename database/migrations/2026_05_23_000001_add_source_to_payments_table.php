<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // 'invoice_record' = created via Record Payment on an invoice
            // 'standalone'     = created via the New Payment page
            $table->string('source', 20)->default('standalone')->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('source');
        });
    }
};
