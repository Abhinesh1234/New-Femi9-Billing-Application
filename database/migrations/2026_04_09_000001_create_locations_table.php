<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();

            // ── Core ──────────────────────────────────────────────────────────
            $table->string('name', 255);
            $table->enum('type', ['business', 'warehouse'])->default('business');
            $table->unsignedBigInteger('parent_id')->nullable();

            // ── Logo ──────────────────────────────────────────────────────────
            $table->enum('logo_type', ['org', 'custom'])->default('org');
            $table->string('logo_path', 500)->nullable();

            // ── Contact / web ─────────────────────────────────────────────────
            $table->string('website_url', 500)->nullable();
            $table->unsignedBigInteger('primary_contact_id')->nullable();

            // ── Transaction series (FKs added after series table exists) ──────
            $table->unsignedBigInteger('txn_series_id')->nullable();
            $table->unsignedBigInteger('default_txn_series_id')->nullable();

            // ── Address (JSON) ────────────────────────────────────────────────
            // {attention, street1, street2, city, pin_code, country, state, phone, fax}
            $table->json('address')->nullable();

            // ── Status ────────────────────────────────────────────────────────
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            // ── Self-referencing FK ───────────────────────────────────────────
            $table->foreign('parent_id')
                ->references('id')->on('locations')
                ->nullOnDelete();

            // ── Indexes ───────────────────────────────────────────────────────
            $table->index('parent_id',              'idx_locations_parent');
            $table->index(['type', 'is_active'],    'idx_locations_type_active');
            $table->index('primary_contact_id',     'idx_locations_primary_contact');
            $table->index('txn_series_id',          'idx_locations_txn_series');
            $table->index('default_txn_series_id',  'idx_locations_default_txn_series');
            $table->index('is_active',              'idx_locations_active');
            $table->index('name',                   'idx_locations_name');
        });

        // Functional indexes on JSON address fields (MySQL 8.0+)
        DB::statement("
            CREATE INDEX idx_locations_country
            ON locations ( (JSON_UNQUOTE(JSON_VALUE(address, '$.country'))) )
        ");

        DB::statement("
            CREATE INDEX idx_locations_city
            ON locations ( (JSON_UNQUOTE(JSON_VALUE(address, '$.city'))) )
        ");

        // CHECK constraint: address must be a JSON object when present
        DB::statement("
            ALTER TABLE locations
            ADD CONSTRAINT chk_address_schema CHECK (
                address IS NULL OR JSON_TYPE(address) = 'OBJECT'
            )
        ");
    }

    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
