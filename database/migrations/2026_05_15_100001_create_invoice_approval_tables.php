<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Main config (singleton — always one row) ──────────────────────────
        Schema::create('invoice_approval_settings', function (Blueprint $table) {
            $table->id();
            $table->enum('approval_type', ['no_approval', 'simple_approval', 'multi_level'])
                  ->default('no_approval');
            $table->boolean('notify_on_submit')->default(false);
            $table->enum('notify_who', ['non_approver', 'all', 'specific_email'])->nullable();
            $table->string('notify_email', 255)->nullable();
            $table->boolean('notify_submitter')->default(false);
            $table->timestamps();
        });

        // ── Approvers for "simple_approval" mode ──────────────────────────────
        Schema::create('invoice_approval_approvers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        // ── Ordered levels for "multi_level" mode ─────────────────────────────
        Schema::create('invoice_approval_hierarchy', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('level_order');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_approval_hierarchy');
        Schema::dropIfExists('invoice_approval_approvers');
        Schema::dropIfExists('invoice_approval_settings');
    }
};
