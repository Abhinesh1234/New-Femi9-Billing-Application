<?php

namespace App\ServerCostCalculator\Http\Middleware;

use App\ServerCostCalculator\Models\RequestMetric;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class CollectRequestMetrics
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! config('server_cost.enabled', true)) {
            return $next($request);
        }

        DB::enableQueryLog();
        $startedAt = hrtime(true);

        /** @var Response $response */
        $response = $next($request);

        $durationMs   = intdiv(hrtime(true) - $startedAt, 1_000_000);
        $peakMemoryKb = intdiv(memory_get_peak_usage(true), 1024);

        $queries    = DB::getQueryLog();
        $queryCount = count($queries);
        $queryMs    = (int) array_sum(array_column($queries, 'time'));

        DB::disableQueryLog();

        $responseSize = strlen($response->getContent() ?? '');

        $endpoint = $request->path();
        if (strlen($endpoint) > 512) {
            $endpoint = substr($endpoint, 0, 512);
        }

        try {
            RequestMetric::create([
                'method'              => $request->method(),
                'endpoint'            => $endpoint,
                'status_code'         => $response->getStatusCode(),
                'duration_ms'         => $durationMs,
                'peak_memory_kb'      => $peakMemoryKb,
                'db_query_count'      => $queryCount,
                'db_query_ms'         => $queryMs,
                'response_size_bytes' => $responseSize,
                'recorded_at'         => now(),
            ]);
        } catch (\Throwable) {
            // Never break the actual request due to metric collection failure.
        }

        return $response;
    }
}
