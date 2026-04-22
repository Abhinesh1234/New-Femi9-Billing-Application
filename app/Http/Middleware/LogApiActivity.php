<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogApiActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $startedAt = hrtime(true);

        /** @var Response $response */
        $response = $next($request);

        // Skip the health-check probe — it fires on every load-balancer ping
        if ($request->is('up')) {
            return $response;
        }

        $durationMs = intdiv(hrtime(true) - $startedAt, 1_000_000);

        // Resolve the matched controller action string, e.g. "ItemController@index"
        $action = $request->route()?->getActionName() ?? 'unknown';
        if (str_contains($action, '\\')) {
            $parts  = explode('\\', $action);
            $action = end($parts);                   // "ItemController@index"
        }

        $user   = $request->user();
        $status = $response->getStatusCode();

        $level = match (true) {
            $status >= 500 => 'error',
            $status >= 400 => 'warning',
            default        => 'info',
        };

        Log::$level('[API] ' . $request->method() . ' ' . $request->path(), [
            'timestamp'   => now()->format('Y-m-d H:i:s.u'),
            'user_id'     => $user?->id,
            'user_name'   => $user?->name,
            'method'      => $request->method(),
            'url'         => $request->fullUrl(),
            'route'       => $action,
            'ip'          => $request->ip(),
            'user_agent'  => $request->userAgent(),
            'status'      => $status,
            'duration_ms' => $durationMs,
        ]);

        return $response;
    }
}
