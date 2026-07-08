<?php

namespace App\ServerCostCalculator\Models;

use Illuminate\Database\Eloquent\Model;

class CostSnapshot extends Model
{
    public $timestamps = false;

    protected $table = 'scc_cost_snapshots';

    protected $fillable = [
        'window_minutes',
        'window_from',
        'window_to',
        'request_count',
        'requests_per_minute',
        'p95_response_ms',
        'avg_response_ms',
        'peak_memory_mb',
        'avg_db_queries_per_req',
        'db_queries_per_minute',
        'total_response_bytes',
        'os_cpu_percent',
        'os_ram_used_mb',
        'os_ram_total_mb',
        'os_disk_used_gb',
        'os_disk_total_gb',
        'projected_monthly_requests',
        'projected_egress_gb',
        'aws_instance',
        'aws_instance_monthly',
        'aws_rds',
        'aws_rds_monthly',
        'aws_storage_monthly',
        'aws_egress_monthly',
        'aws_total_monthly',
        'gcp_instance',
        'gcp_instance_monthly',
        'gcp_cloudsql',
        'gcp_cloudsql_monthly',
        'gcp_storage_monthly',
        'gcp_egress_monthly',
        'gcp_total_monthly',
        'created_at',
    ];

    protected $casts = [
        'window_from' => 'datetime',
        'window_to'   => 'datetime',
        'created_at'  => 'datetime',
    ];
}
