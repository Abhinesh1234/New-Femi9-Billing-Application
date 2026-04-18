<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();

            // ── What was changed ──────────────────────────────────────────────
            $table->string('auditable_type', 100);   // e.g. "item", "customer"
            $table->unsignedBigInteger('auditable_id');
            $table->enum('event', ['created', 'updated', 'deleted', 'restored']);

            // ── Who changed it ────────────────────────────────────────────────
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();

            // ── What changed (only the affected fields) ───────────────────────
            $table->json('old_values')->nullable(); // {field: value_before}
            $table->json('new_values')->nullable(); // {field: value_after}

            // Immutable — audit logs are never updated or deleted
            $table->timestamp('created_at')->useCurrent();

            // ── Indexes ───────────────────────────────────────────────────────
            $table->index(['auditable_type', 'auditable_id'],               'audit_logs_auditable_index');
            $table->index(['auditable_type', 'auditable_id', 'event'],      'audit_logs_auditable_event_index');
            $table->index(['user_id', 'created_at'],                        'audit_logs_user_created_index');
            $table->index('created_at',                                     'audit_logs_created_at_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
