<?php

namespace App\ServerCostCalculator\Services;

/**
 * Maps APP-LEVEL metrics to the cheapest suitable AWS and GCP tiers.
 *
 * Tier-selection is based on what the APPLICATION consumes — not the host machine:
 *
 *   Compute RAM  = concurrent PHP workers needed × peak PHP memory per request × headroom
 *   Compute vCPU = derived from requests/min × avg response time (Little's Law)
 *   DB tier      = derived from DB queries/min (300 q/min per GB is a MySQL rule-of-thumb)
 *   Storage      = app directory size + DB size (not the host disk)
 *   Egress       = actual response bytes sent during the window
 *
 * OS RAM and OS disk are intentionally excluded from tier selection.
 */
class ServerCostEstimator
{
    private array $awsCfg;
    private array $gcpCfg;
    private float $headroom;
    private float $cpuTarget;

    // Fixed OS overhead in MB added on top of PHP worker RAM (Nginx + Redis + OS kernel)
    private const OS_OVERHEAD_MB = 256;

    public function __construct()
    {
        $this->awsCfg    = config('server_cost.aws');
        $this->gcpCfg    = config('server_cost.gcp');
        $this->headroom  = (float) config('server_cost.ram_headroom_factor', 2.0);
        $this->cpuTarget = (float) config('server_cost.cpu_utilisation_target', 0.70);
    }

    public function estimate(array $metrics, int $windowMinutes = 5): array
    {
        $windowHours = $windowMinutes / 60;

        return [
            'aws' => $this->estimateAws($metrics, $windowHours),
            'gcp' => $this->estimateGcp($metrics, $windowHours),
        ];
    }

    // ─── AWS ──────────────────────────────────────────────────────────────────

    private function estimateAws(array $m, float $windowHours): array
    {
        $ec2  = $this->pickAwsEc2($m);
        $rds  = $this->pickAwsRds($m);
        $disk = $this->storageCostAws($m, $windowHours);
        $egr  = $this->egressCostAws($m);

        $ec2Cost = round($ec2['hourly'] * $windowHours, 6);
        $rdsCost = round($rds['hourly'] * $windowHours, 6);

        return [
            'instance'      => $ec2['name'],
            'instance_cost' => $ec2Cost,
            'rds'           => $rds['name'],
            'rds_cost'      => $rdsCost,
            'storage_cost'  => $disk,
            'egress_cost'   => $egr,
            'total_cost'    => round($ec2Cost + $rdsCost + $disk + $egr, 6),
        ];
    }

    private function pickAwsEc2(array $m): array
    {
        $needRamGb = $this->appRamNeededGb($m);
        $needVcpu  = $this->estimateVcpu($m);
        $tiers     = $this->awsCfg['ec2_tiers'];

        foreach ($tiers as $tier) {
            if ($tier['ram_gb'] >= $needRamGb && $tier['vcpu'] >= $needVcpu) {
                return $tier;
            }
        }
        return end($tiers);
    }

    private function pickAwsRds(array $m): array
    {
        $needRamGb = $this->dbRamNeededGb($m);
        $tiers     = $this->awsCfg['rds_tiers'];

        foreach ($tiers as $tier) {
            if ($tier['ram_gb'] >= $needRamGb) return $tier;
        }
        return end($tiers);
    }

    private function storageCostAws(array $m, float $windowHours): float
    {
        $diskGb        = ($m['app_disk_gb'] ?? 1) * 1.3;
        $fullMonthCost = $diskGb * $this->awsCfg['storage_per_gb_month'];
        return round($fullMonthCost * ($windowHours / $this->awsCfg['hours_per_month']), 8);
    }

    private function egressCostAws(array $m): float
    {
        $actualGb = ($m['total_response_bytes'] ?? 0) / (1024 ** 3);
        return round($actualGb * $this->awsCfg['egress_per_gb'], 8);
    }

    // ─── GCP ──────────────────────────────────────────────────────────────────

    private function estimateGcp(array $m, float $windowHours): array
    {
        $vm   = $this->pickGcpVm($m);
        $sql  = $this->pickGcpCloudSql($m);
        $disk = $this->storageCostGcp($m, $windowHours);
        $egr  = $this->egressCostGcp($m);

        $vmCost  = round($vm['hourly'] * $windowHours, 6);
        $sqlCost = round($sql['hourly'] * $windowHours, 6);

        return [
            'instance'      => $vm['name'],
            'instance_cost' => $vmCost,
            'cloudsql'      => $sql['name'],
            'cloudsql_cost' => $sqlCost,
            'storage_cost'  => $disk,
            'egress_cost'   => $egr,
            'total_cost'    => round($vmCost + $sqlCost + $disk + $egr, 6),
        ];
    }

    private function pickGcpVm(array $m): array
    {
        $needRamGb = $this->appRamNeededGb($m);
        $needVcpu  = $this->estimateVcpu($m);
        $tiers     = $this->gcpCfg['compute_tiers'];

        foreach ($tiers as $tier) {
            if ($tier['ram_gb'] >= $needRamGb && $tier['vcpu'] >= $needVcpu) {
                return $tier;
            }
        }
        return end($tiers);
    }

    private function pickGcpCloudSql(array $m): array
    {
        $needRamGb = $this->dbRamNeededGb($m);
        $tiers     = $this->gcpCfg['cloudsql_tiers'];

        foreach ($tiers as $tier) {
            if ($tier['ram_gb'] >= $needRamGb) return $tier;
        }
        return end($tiers);
    }

    private function storageCostGcp(array $m, float $windowHours): float
    {
        $diskGb        = ($m['app_disk_gb'] ?? 1) * 1.3;
        $fullMonthCost = $diskGb * $this->gcpCfg['storage_per_gb_month'];
        return round($fullMonthCost * ($windowHours / $this->gcpCfg['hours_per_month']), 8);
    }

    private function egressCostGcp(array $m): float
    {
        $actualGb = ($m['total_response_bytes'] ?? 0) / (1024 ** 3);
        return round($actualGb * $this->gcpCfg['egress_per_gb'], 8);
    }

    // ─── Shared helpers ───────────────────────────────────────────────────────

    /**
     * How much RAM does the app need on a production server?
     *
     * concurrent_workers = requests_per_min × avg_response_seconds / 60  (Little's Law)
     * app_ram = (workers × peak_php_memory_per_request × headroom) + OS_OVERHEAD
     *
     * Minimum floor of 0.25 GB so we never pick a sub-micro tier.
     */
    private function appRamNeededGb(array $m): float
    {
        $rpm         = max(1, (float) ($m['requests_per_minute'] ?? 1));
        $avgSeconds  = max(0.05, ((float) ($m['avg_response_ms'] ?? 50)) / 1000);
        $peakMemMb   = max(16, (float) ($m['app_peak_memory_mb'] ?? 32));

        // Concurrent workers needed to sustain this request rate (Little's Law)
        $concurrentWorkers = $rpm * $avgSeconds / 60;
        $workersWithBuffer = max(2, ceil($concurrentWorkers * $this->headroom));

        $appRamMb  = ($workersWithBuffer * $peakMemMb) + self::OS_OVERHEAD_MB;
        $appRamGb  = $appRamMb / 1024;

        return max(0.25, round($appRamGb, 3));
    }

    /**
     * Estimate vCPU need from requests/min × avg response time (Little's Law).
     * cpu_seconds_per_minute = rpm × avg_response_seconds
     * vcpu_needed = cpu_seconds_per_minute / (60 × target_utilisation)
     */
    private function estimateVcpu(array $m): float
    {
        $rpm     = max(1, (float) ($m['requests_per_minute'] ?? 1));
        $avgSec  = max(0.05, ((float) ($m['avg_response_ms'] ?? 50)) / 1000);
        $vcpu    = ($rpm * $avgSec) / (60 * $this->cpuTarget);
        return max(0.25, $vcpu);
    }

    /**
     * DB tier: 1 GB RAM per 300 queries/min (MySQL rule-of-thumb).
     */
    private function dbRamNeededGb(array $m): float
    {
        $qpm = max(0, (float) ($m['db_queries_per_minute'] ?? 0));
        return max(0.5, $qpm / 300);
    }
}
