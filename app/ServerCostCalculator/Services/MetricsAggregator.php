<?php

namespace App\ServerCostCalculator\Services;

use App\ServerCostCalculator\Models\CostSnapshot;
use App\ServerCostCalculator\Models\RequestMetric;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class MetricsAggregator
{
    public function __construct(
        private readonly SystemMetricsCollector $sysCollector,
        private readonly ServerCostEstimator    $estimator,
    ) {}

    public function run(int $windowMinutes): void
    {
        $windowTo   = now();
        $windowFrom = $windowTo->copy()->subMinutes($windowMinutes);

        $requestAggregates = $this->aggregateRequests($windowFrom, $windowTo, $windowMinutes);
        $osMetrics         = $this->sysCollector->collect();

        $merged = array_merge($requestAggregates, [
            // App-level — used for cost tier selection
            'app_disk_gb'        => $osMetrics['app_disk_gb'],
            'app_peak_memory_mb' => $requestAggregates['peak_memory_mb'], // PHP memory from requests

            // OS-level — informational display only
            'os_cpu_percent'     => $osMetrics['os_cpu_percent'],
            'os_ram_used_mb'     => $osMetrics['os_ram_used_mb'],
            'os_ram_total_mb'    => $osMetrics['os_ram_total_mb'],
            'os_disk_used_gb'    => $osMetrics['os_disk_used_gb'],
            'os_disk_total_gb'   => $osMetrics['os_disk_total_gb'],
        ]);

        $cost = $this->estimator->estimate($merged, $windowMinutes);

        $snapshot = $this->persist($merged, $cost, $windowFrom, $windowTo, $windowMinutes);

        $this->logReport($snapshot, $merged, $cost, $osMetrics, $windowMinutes);

        $this->pruneOldMetrics();
    }

    // ─── Request aggregation ──────────────────────────────────────────────────

    private function aggregateRequests(Carbon $from, Carbon $to, int $windowMinutes): array
    {
        $rows  = RequestMetric::whereBetween('recorded_at', [$from, $to])->get();
        $count = $rows->count();

        if ($count === 0) {
            return [
                'request_count'          => 0,
                'requests_per_minute'    => 0.0,
                'p95_response_ms'        => 0,
                'avg_response_ms'        => 0,
                'peak_memory_mb'         => 0,
                'avg_db_queries_per_req' => 0.0,
                'db_queries_per_minute'  => 0.0,
                'total_response_bytes'   => 0,
            ];
        }

        $durations    = $rows->pluck('duration_ms')->sort()->values();
        $p95Index     = (int) floor($count * 0.95);
        $p95          = $durations->get(min($p95Index, $count - 1), 0);
        $avgMs        = (int) $rows->avg('duration_ms');
        $peakMemMb    = (int) intdiv((int) $rows->max('peak_memory_kb'), 1024);
        $totalBytes   = (int) $rows->sum('response_size_bytes');
        $avgQueries   = round($rows->avg('db_query_count'), 2);
        $totalQueries = $rows->sum('db_query_count');

        return [
            'request_count'          => $count,
            'requests_per_minute'    => round($count / $windowMinutes, 2),
            'p95_response_ms'        => $p95,
            'avg_response_ms'        => $avgMs,
            'peak_memory_mb'         => $peakMemMb,
            'avg_db_queries_per_req' => $avgQueries,
            'db_queries_per_minute'  => round($totalQueries / $windowMinutes, 2),
            'total_response_bytes'   => $totalBytes,
        ];
    }

    // ─── Persistence ──────────────────────────────────────────────────────────

    private function persist(array $m, array $cost, Carbon $from, Carbon $to, int $window): CostSnapshot
    {
        return CostSnapshot::create([
            'window_minutes'             => $window,
            'window_from'                => $from,
            'window_to'                  => $to,
            'request_count'              => $m['request_count'],
            'requests_per_minute'        => $m['requests_per_minute'],
            'p95_response_ms'            => $m['p95_response_ms'],
            'avg_response_ms'            => $m['avg_response_ms'],
            'peak_memory_mb'             => $m['peak_memory_mb'],
            'avg_db_queries_per_req'     => $m['avg_db_queries_per_req'],
            'db_queries_per_minute'      => $m['db_queries_per_minute'],
            'total_response_bytes'       => $m['total_response_bytes'],
            'os_cpu_percent'             => $m['os_cpu_percent'],
            'os_ram_used_mb'             => $m['os_ram_used_mb'],
            'os_ram_total_mb'            => $m['os_ram_total_mb'],
            'os_disk_used_gb'            => $m['os_disk_used_gb'],
            'os_disk_total_gb'           => $m['os_disk_total_gb'],
            'projected_monthly_requests' => 0,
            'projected_egress_gb'        => 0,
            'aws_instance'               => $cost['aws']['instance'],
            'aws_instance_monthly'       => $cost['aws']['instance_cost'],
            'aws_rds'                    => $cost['aws']['rds'],
            'aws_rds_monthly'            => $cost['aws']['rds_cost'],
            'aws_storage_monthly'        => $cost['aws']['storage_cost'],
            'aws_egress_monthly'         => $cost['aws']['egress_cost'],
            'aws_total_monthly'          => $cost['aws']['total_cost'],
            'gcp_instance'               => $cost['gcp']['instance'],
            'gcp_instance_monthly'       => $cost['gcp']['instance_cost'],
            'gcp_cloudsql'               => $cost['gcp']['cloudsql'],
            'gcp_cloudsql_monthly'       => $cost['gcp']['cloudsql_cost'],
            'gcp_storage_monthly'        => $cost['gcp']['storage_cost'],
            'gcp_egress_monthly'         => $cost['gcp']['egress_cost'],
            'gcp_total_monthly'          => $cost['gcp']['total_cost'],
            'created_at'                 => now(),
        ]);
    }

    // ─── Logging ──────────────────────────────────────────────────────────────

    private function logReport(CostSnapshot $snap, array $m, array $cost, array $os, int $windowMinutes): void
    {
        $logger = Log::build([
            'driver' => 'daily',
            'path'   => storage_path('logs/server_cost.log'),
            'days'   => 30,
        ]);

        $rate = (float) config('server_cost.usd_to_inr', 84.5);

        // Format small fractional INR values to enough decimal places to be meaningful.
        $inr = function (float $usd) use ($rate): string {
            $val = $usd * $rate;
            if ($val < 0.01) {
                return '₹' . number_format($val, 6);
            }
            return '₹' . number_format(round($val, 4), 4);
        };

        $windowLabel = $windowMinutes >= 60
            ? round($windowMinutes / 60, 1) . ' hr'
            : $windowMinutes . ' min';

        $report = [
            'snapshot_id'   => $snap->id,
            'timestamp'     => now()->toDateTimeString(),
            'window'        => $windowLabel,
            'exchange_rate' => "1 USD = ₹{$rate}",

            'load' => [
                'requests'            => $m['request_count'],
                'requests_per_minute' => $m['requests_per_minute'],
                'p95_response_ms'     => $m['p95_response_ms'],
                'avg_response_ms'     => $m['avg_response_ms'],
                'db_queries_per_min'  => $m['db_queries_per_minute'],
                'data_transferred'    => $this->formatBytes($m['total_response_bytes']),
            ],

            // App-only resources — what a dedicated server would actually need
            'app_resources' => [
                'php_peak_memory_per_req' => ($m['app_peak_memory_mb'] ?? 0) . ' MB',
                'app_disk_size'           => ($m['app_disk_gb'] ?? 0) . ' GB',
                'note'                    => 'Used for tier selection (not host machine metrics)',
            ],

            // Host machine info — for reference only, NOT used for cost calculation
            'host_machine_info' => [
                'os_cpu'      => ($os['os_cpu_percent'] !== null ? $os['os_cpu_percent'] . '%' : 'n/a') . ' (whole machine)',
                'os_ram'      => ($os['os_ram_used_mb'] ?? 'n/a') . ' / ' . ($os['os_ram_total_mb'] ?? 'n/a') . ' MB (whole machine)',
                'os_disk'     => ($os['os_disk_used_gb'] ?? 'n/a') . ' / ' . ($os['os_disk_total_gb'] ?? 'n/a') . ' GB (whole machine)',
                'note'        => 'Informational only — excluded from cost calculation',
            ],

            'aws_cost_for_this_window' => [
                'instance'      => $cost['aws']['instance'],
                'instance_cost' => $inr($cost['aws']['instance_cost']),
                'rds'           => $cost['aws']['rds'],
                'rds_cost'      => $inr($cost['aws']['rds_cost']),
                'storage_cost'  => $inr($cost['aws']['storage_cost']),
                'egress_cost'   => $inr($cost['aws']['egress_cost']),
                'TOTAL'         => $inr($cost['aws']['total_cost']),
            ],

            'gcp_cost_for_this_window' => [
                'instance'      => $cost['gcp']['instance'],
                'instance_cost' => $inr($cost['gcp']['instance_cost']),
                'cloud_sql'     => $cost['gcp']['cloudsql'],
                'cloudsql_cost' => $inr($cost['gcp']['cloudsql_cost']),
                'storage_cost'  => $inr($cost['gcp']['storage_cost']),
                'egress_cost'   => $inr($cost['gcp']['egress_cost']),
                'TOTAL'         => $inr($cost['gcp']['total_cost']),
            ],
        ];

        $logger->info('=== Server Cost Report ===', $report);
    }

    // ─── Housekeeping ─────────────────────────────────────────────────────────

    private function pruneOldMetrics(): void
    {
        $rawCutoff  = now()->subDays((int) config('server_cost.raw_retention_days', 7));
        $snapCutoff = now()->subDays((int) config('server_cost.snapshot_retention_days', 90));

        RequestMetric::where('recorded_at', '<', $rawCutoff)->delete();
        CostSnapshot::where('created_at', '<', $snapCutoff)->delete();
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes < 1024) return $bytes . ' B';
        if ($bytes < 1024 ** 2) return round($bytes / 1024, 2) . ' KB';
        if ($bytes < 1024 ** 3) return round($bytes / 1024 ** 2, 2) . ' MB';
        return round($bytes / 1024 ** 3, 3) . ' GB';
    }
}
