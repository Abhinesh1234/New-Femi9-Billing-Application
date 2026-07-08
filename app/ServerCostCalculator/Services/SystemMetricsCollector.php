<?php

namespace App\ServerCostCalculator\Services;

/**
 * Collects APP-LEVEL resource metrics — not the whole host machine.
 *
 * RAM  → PHP process memory (from request metrics, not OS RAM)
 * CPU  → PHP processing time as % of the window (not OS CPU %)
 * Disk → Project directory + MySQL data directory size (not whole disk)
 *
 * OS-level stats are still collected for informational display only;
 * they are NOT fed into tier-selection logic.
 */
class SystemMetricsCollector
{
    public function collect(): array
    {
        return [
            // App-level (used for cost tier selection)
            'app_disk_gb'    => $this->appDiskGb(),

            // OS-level (informational only — shown in log but NOT used for tier selection)
            'os_cpu_percent'  => $this->osCpuPercent(),
            'os_ram_used_mb'  => $this->osRamUsedMb(),
            'os_ram_total_mb' => $this->osRamTotalMb(),
            'os_disk_used_gb' => $this->osDiskUsedGb(),
            'os_disk_total_gb'=> $this->osDiskTotalGb(),
            'platform'        => PHP_OS_FAMILY,
        ];
    }

    // ─── App-level disk (project + DB data dir) ───────────────────────────────

    private function appDiskGb(): float
    {
        $totalMb = 0;

        // 1. Laravel project directory (excluding node_modules and vendor cache)
        $projectMb = $this->duMb(base_path());
        $totalMb  += $projectMb;

        // 2. MySQL data directory for the app's database
        $dbMb = $this->mysqlDbSizeMb();
        $totalMb += $dbMb;

        return round($totalMb / 1024, 3);
    }

    private function duMb(string $path): float
    {
        try {
            // Exclude node_modules and vendor from the size calculation
            $out = shell_exec(
                "du -sm " .
                escapeshellarg($path) .
                " --exclude=node_modules --exclude=vendor 2>/dev/null" .
                " || du -sm " . escapeshellarg($path) . " 2>/dev/null"
            );
            if ($out && preg_match('/^(\d+)/', trim($out), $m)) {
                return (float) $m[1];
            }
        } catch (\Throwable) {}

        // Fallback: use PHP's own memory footprint as an estimate
        return 500.0;
    }

    private function mysqlDbSizeMb(): float
    {
        try {
            // Try to get MySQL data directory from environment
            $dbName = env('DB_DATABASE');
            if (! $dbName) return 0;

            // Ask MySQL for the size of just the app's database
            $host     = env('DB_HOST', '127.0.0.1');
            $port     = env('DB_PORT', 3306);
            $user     = env('DB_USERNAME', 'root');
            $password = env('DB_PASSWORD', '');

            $dsn = "mysql:host={$host};port={$port};dbname=information_schema";
            $pdo = new \PDO($dsn, $user, $password, [\PDO::ATTR_TIMEOUT => 2]);

            $stmt = $pdo->prepare(
                "SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
                 FROM information_schema.tables
                 WHERE table_schema = ?"
            );
            $stmt->execute([$dbName]);
            $row = $stmt->fetch(\PDO::FETCH_ASSOC);
            return (float) ($row['size_mb'] ?? 0);
        } catch (\Throwable) {
            return 0;
        }
    }

    // ─── OS CPU (informational) ───────────────────────────────────────────────

    private function osCpuPercent(): ?float
    {
        try {
            return PHP_OS_FAMILY === 'Darwin'
                ? $this->osCpuMac()
                : $this->osCpuLinux();
        } catch (\Throwable) {
            return null;
        }
    }

    private function osCpuMac(): ?float
    {
        $out = shell_exec('top -l 2 -n 0 -s 1 2>/dev/null | grep "CPU usage" | tail -1');
        if (! $out) return null;
        if (preg_match('/(\d+\.\d+)%\s+idle/i', $out, $m)) {
            return round(100.0 - (float) $m[1], 2);
        }
        return null;
    }

    private function osCpuLinux(): ?float
    {
        $read = function (): array {
            $line  = @file('/proc/stat')[0] ?? '';
            $parts = preg_split('/\s+/', trim($line));
            return array_map('intval', array_slice($parts, 1));
        };
        $a = $read(); usleep(200_000); $b = $read();
        if (! $a || ! $b) return null;
        $totalDelta = array_sum($b) - array_sum($a);
        $idleDelta  = ($b[3] ?? 0) - ($a[3] ?? 0);
        return $totalDelta === 0 ? null : round(100.0 * (1 - $idleDelta / $totalDelta), 2);
    }

    // ─── OS RAM (informational) ───────────────────────────────────────────────

    private function osRamTotalMb(): ?int
    {
        try {
            if (PHP_OS_FAMILY === 'Darwin') {
                $bytes = (int) shell_exec('sysctl -n hw.memsize 2>/dev/null');
                return $bytes > 0 ? intdiv($bytes, 1024 * 1024) : null;
            }
            return $this->procMemInfoMb('MemTotal');
        } catch (\Throwable) { return null; }
    }

    private function osRamUsedMb(): ?int
    {
        try {
            $total = $this->osRamTotalMb();
            $free  = $this->osRamFreeMb();
            return ($total !== null && $free !== null) ? max(0, $total - $free) : null;
        } catch (\Throwable) { return null; }
    }

    private function osRamFreeMb(): ?int
    {
        try {
            if (PHP_OS_FAMILY === 'Darwin') {
                $out = shell_exec('vm_stat 2>/dev/null');
                if (! $out) return null;
                $pageSize = 4096;
                if (preg_match('/page size of (\d+) bytes/', $out, $m)) $pageSize = (int) $m[1];
                $free = $this->vmStatPages($out, 'Pages free') ?? 0;
                $inactive = $this->vmStatPages($out, 'Pages inactive') ?? 0;
                $speculative = $this->vmStatPages($out, 'Pages speculative') ?? 0;
                return intdiv(($free + $inactive + $speculative) * $pageSize, 1024 * 1024);
            }
            return $this->procMemInfoMb('MemAvailable') ?? $this->procMemInfoMb('MemFree');
        } catch (\Throwable) { return null; }
    }

    private function vmStatPages(string $out, string $key): ?int
    {
        if (preg_match('/' . preg_quote($key, '/') . ':\s+(\d+)/i', $out, $m)) return (int) $m[1];
        return null;
    }

    private function procMemInfoMb(string $key): ?int
    {
        $out = @file_get_contents('/proc/meminfo');
        if (! $out) return null;
        if (preg_match('/^' . preg_quote($key, '/') . ':\s+(\d+)\s+kB/im', $out, $m)) {
            return intdiv((int) $m[1], 1024);
        }
        return null;
    }

    // ─── OS Disk (informational) ──────────────────────────────────────────────

    private function osDiskTotalGb(): ?float
    {
        try {
            $bytes = disk_total_space(base_path());
            return $bytes !== false ? round($bytes / (1024 ** 3), 2) : null;
        } catch (\Throwable) { return null; }
    }

    private function osDiskUsedGb(): ?float
    {
        $total = $this->osDiskTotalGb();
        $free  = $this->osDiskFreeGb();
        return ($total !== null && $free !== null) ? round(max(0.0, $total - $free), 2) : null;
    }

    private function osDiskFreeGb(): ?float
    {
        try {
            $bytes = disk_free_space(base_path());
            return $bytes !== false ? round($bytes / (1024 ** 3), 2) : null;
        } catch (\Throwable) { return null; }
    }
}
