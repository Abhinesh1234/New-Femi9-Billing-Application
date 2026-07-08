<?php

namespace App\ServerCostCalculator\Models;

use Illuminate\Database\Eloquent\Model;

class RequestMetric extends Model
{
    public $timestamps = false;

    protected $table = 'scc_request_metrics';

    protected $fillable = [
        'method',
        'endpoint',
        'status_code',
        'duration_ms',
        'peak_memory_kb',
        'db_query_count',
        'db_query_ms',
        'response_size_bytes',
        'recorded_at',
    ];

    protected $casts = [
        'recorded_at' => 'datetime',
    ];
}
