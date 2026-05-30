<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE payments MODIFY COLUMN payment_mode ENUM('cash','cheque','bank_transfer','credit_card','upi','advance_payment') NOT NULL DEFAULT 'cash'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE payments MODIFY COLUMN payment_mode ENUM('cash','cheque','bank_transfer','credit_card','upi') NOT NULL DEFAULT 'cash'");
    }
};
