<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

abstract class Controller
{
    /**
     * Consistent JSON success response.
     */
    protected function successResponse(array $data, int $status = 200): JsonResponse
    {
        return response()->json(array_merge(['success' => true], $data), $status);
    }

    /**
     * Consistent JSON error response.
     */
    protected function errorResponse(string $message, int $status, array $extra = []): JsonResponse
    {
        return response()->json(array_merge([
            'success' => false,
            'message' => $message,
        ], $extra), $status);
    }

    /**
     * Structured logging context.
     */
    protected function buildCtx(Request $request, string $tag, array $extra = []): array
    {
        return array_merge([
            'tag'      => $tag,
            'datetime' => now()->format('Y-m-d H:i:s.u'),
            'ip'       => $request->ip(),
            'method'   => $request->method(),
            'url'      => $request->fullUrl(),
            'user_id'  => $request->user()?->id,
        ], $extra);
    }

    /**
     * Log a caught exception uniformly.
     */
    protected function logException(string $tag, \Throwable $e, array $ctx = []): void
    {
        Log::error("[{$tag}] Unhandled exception", array_merge($ctx, [
            'error'      => $e->getMessage(),
            'error_file' => $e->getFile(),
            'error_line' => $e->getLine(),
        ]));
    }
}
