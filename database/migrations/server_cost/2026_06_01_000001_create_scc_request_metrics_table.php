<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scc_request_metrics', function (Blueprint $table) {
            $table->id();
            $table->string('method', 10);
            $table->string('endpoint', 512);
            $table->unsignedSmallInteger('status_code');
            $table->unsignedInteger('duration_ms');
            $table->unsignedInteger('peak_memory_kb');
            $table->unsignedSmallInteger('db_query_count')->default(0);
            $table->unsignedInteger('db_query_ms')->default(0);
            $table->unsignedInteger('response_size_bytes')->default(0);
            $table->timestamp('recorded_at')->useCurrent()->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scc_request_metrics');
    }
};
