<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parties', function (Blueprint $table) {
            $table->id();

            // Generated: "DIST-0001" (business) | "CUS-F-0001" (individual)
            $table->string('party_id', 50)->unique();

            $table->enum('party_type', ['business', 'individual'])->default('business');

            // ── Primary contact ───────────────────────────────────────────────
            $table->string('salutation', 20)->nullable();
            $table->string('first_name', 100)->nullable();
            $table->string('last_name', 100)->nullable();
            $table->string('company_name', 255)->nullable();
            $table->string('display_name', 255);

            // ── Contact info ──────────────────────────────────────────────────
            $table->string('email', 255)->nullable();
            $table->string('work_phone_code', 15)->nullable();
            $table->string('work_phone', 30)->nullable();
            $table->string('mobile_code', 15)->nullable();
            $table->string('mobile', 30)->nullable();
            $table->string('language', 50)->nullable()->default('english');

            // ── Classification ────────────────────────────────────────────────
            $table->foreignId('distribution_category_id')
                ->constrained('distribution_categories');
            $table->foreignId('distribution_sub_category_id')
                ->nullable()
                ->constrained('distribution_sub_categories')
                ->nullOnDelete();

            // ── Financial / other details ─────────────────────────────────────
            $table->string('pan', 20)->nullable();
            $table->string('gst', 20)->nullable();
            $table->string('account_number', 50)->nullable();
            $table->string('ifsc_code', 20)->nullable();
            $table->string('upi_number', 50)->nullable();
            $table->string('currency', 10)->nullable()->default('INR');
            $table->string('payment_terms', 50)->nullable()->default('due_on_receipt');
            $table->boolean('enable_portal')->default(false);

            // ── Media & notes ─────────────────────────────────────────────────
            $table->string('party_image', 500)->nullable();
            $table->text('remarks')->nullable();

            // ── JSON columns ──────────────────────────────────────────────────
            //
            // contact_persons — array of objects, always shown with the party,
            //   never queried independently.
            //   [ { salutation, name, email, mobile_code, mobile }, ... ]
            //
            // custom_fields — flat key→value map, dynamic schema.
            //   { "customer_dob": "1990-01-01", "cf_email": "x@y.com", ... }
            //
            // documents — file metadata, always loaded with the party.
            //   [ { file_name, file_path, file_size, mime_type }, ... ]
            //
            $table->json('contact_persons')->nullable();
            $table->json('custom_fields')->nullable();
            $table->json('documents')->nullable();

            // ── Audit ─────────────────────────────────────────────────────────
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            // ── Indexes ───────────────────────────────────────────────────────
            $table->index('party_type');
            $table->index('distribution_category_id');
            $table->index('email');
            $table->index(['first_name', 'last_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parties');
    }
};
