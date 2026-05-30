<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Change enum: replace 'received' with 'transferred'
        DB::statement("ALTER TABLE transfer_orders
            MODIFY COLUMN status ENUM('draft','in_transit','transferred','cancelled')
            NOT NULL DEFAULT 'draft'");

        Schema::table('transfer_orders', function (Blueprint $table) {
            $table->timestamp('initiated_at')->nullable()->after('status');
            $table->foreignId('initiated_by')->nullable()->after('initiated_at')->constrained('users')->nullOnDelete();
            $table->timestamp('transferred_at')->nullable()->after('initiated_by');
            $table->foreignId('transferred_by')->nullable()->after('transferred_at')->constrained('users')->nullOnDelete();
            $table->timestamp('cancelled_at')->nullable()->after('transferred_by');
            $table->foreignId('cancelled_by')->nullable()->after('cancelled_at')->constrained('users')->nullOnDelete();
            $table->text('cancellation_reason')->nullable()->after('cancelled_by');
        });
    }

    public function down(): void
    {
        Schema::table('transfer_orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('initiated_by');
            $table->dropConstrainedForeignId('transferred_by');
            $table->dropConstrainedForeignId('cancelled_by');
            $table->dropColumn(['initiated_at', 'transferred_at', 'cancelled_at', 'cancellation_reason']);
        });

        DB::statement("ALTER TABLE transfer_orders
            MODIFY COLUMN status ENUM('draft','in_transit','received','cancelled')
            NOT NULL DEFAULT 'draft'");
    }
};
