<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scc_cost_snapshots', function (Blueprint $table) {
            $table->id();

            // Window this snapshot covers
            $table->unsignedTinyInteger('window_minutes');
            $table->timestamp('window_from');
            $table->timestamp('window_to');

            // Request-level aggregates
            $table->unsignedInteger('request_count')->default(0);
            $table->decimal('requests_per_minute', 8, 2)->default(0);
            $table->unsignedInteger('p95_response_ms')->default(0);
            $table->unsignedInteger('avg_response_ms')->default(0);
            $table->unsignedInteger('peak_memory_mb')->default(0);
            $table->decimal('avg_db_queries_per_req', 6, 2)->default(0);
            $table->decimal('db_queries_per_minute', 8, 2)->default(0);
            $table->unsignedBigInteger('total_response_bytes')->default(0);

            // OS-level metrics at snapshot time
            $table->decimal('os_cpu_percent', 5, 2)->nullable();
            $table->unsignedInteger('os_ram_used_mb')->nullable();
            $table->unsignedInteger('os_ram_total_mb')->nullable();
            $table->decimal('os_disk_used_gb', 10, 2)->nullable();
            $table->decimal('os_disk_total_gb', 10, 2)->nullable();

            // 30-day projections
            $table->decimal('projected_monthly_requests', 14, 0)->default(0);
            $table->decimal('projected_egress_gb', 10, 3)->default(0);

            // AWS cost estimate (USD/month)
            $table->string('aws_instance', 30)->nullable();
            $table->decimal('aws_instance_monthly', 8, 2)->nullable();
            $table->string('aws_rds', 30)->nullable();
            $table->decimal('aws_rds_monthly', 8, 2)->nullable();
            $table->decimal('aws_storage_monthly', 8, 2)->nullable();
            $table->decimal('aws_egress_monthly', 8, 2)->nullable();
            $table->decimal('aws_total_monthly', 8, 2)->nullable();

            // GCP cost estimate (USD/month)
            $table->string('gcp_instance', 40)->nullable();
            $table->decimal('gcp_instance_monthly', 8, 2)->nullable();
            $table->string('gcp_cloudsql', 40)->nullable();
            $table->decimal('gcp_cloudsql_monthly', 8, 2)->nullable();
            $table->decimal('gcp_storage_monthly', 8, 2)->nullable();
            $table->decimal('gcp_egress_monthly', 8, 2)->nullable();
            $table->decimal('gcp_total_monthly', 8, 2)->nullable();

            $table->timestamp('created_at')->useCurrent()->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scc_cost_snapshots');
    }
};
