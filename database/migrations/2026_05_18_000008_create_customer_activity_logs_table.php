<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_activity_logs', function (Blueprint $table) {
            $table->id();

            // ── Customer this event belongs to ────────────────────────────────
            $table->foreignId('customer_id')->constrained('parties')->cascadeOnDelete();

            // ── What happened ─────────────────────────────────────────────────
            $table->enum('event_type', [
                'invoice_created',
                'invoice_updated',
                'invoice_sent',
                'invoice_voided',
                'invoice_paid',
                'invoice_partially_paid',
                'payment_received',
                'payment_applied',
                'payment_unapplied',
                'payment_deleted',
            ]);

            // ── Primary subject (what the event is about) ─────────────────────
            $table->enum('subject_type', ['invoice', 'payment']);
            $table->unsignedBigInteger('subject_id');

            // ── Related entity (the "other side" in cross-entity events) ──────
            //   e.g. payment_applied: subject = payment, related = invoice
            $table->enum('related_type', ['invoice', 'payment'])->nullable();
            $table->unsignedBigInteger('related_id')->nullable();

            // ── Key monetary figure for display in the timeline ───────────────
            $table->decimal('amount', 15, 2)->nullable();

            // ── Human-readable context ────────────────────────────────────────
            //   Stored denormalised so the timeline never breaks if the
            //   original record is deleted.
            //   invoice events: { invoice_number, due_date, grand_total, status }
            //   payment events: { payment_number, payment_mode, reference_number }
            //   cross events:   all of the above that apply
            $table->json('metadata')->nullable();

            // ── Who triggered it ──────────────────────────────────────────────
            $table->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete();

            // Immutable — activity logs are never updated
            $table->timestamp('created_at')->useCurrent();

            // ── Indexes ───────────────────────────────────────────────────────
            $table->index(['customer_id', 'created_at'],      'cal_customer_timeline_index');
            $table->index(['subject_type', 'subject_id'],     'cal_subject_index');
            $table->index(['related_type', 'related_id'],     'cal_related_index');
            $table->index('event_type',                       'cal_event_type_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_activity_logs');
    }
};
