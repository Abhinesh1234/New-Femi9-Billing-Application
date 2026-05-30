<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options',  'nosniff');
        $response->headers->set('X-Frame-Options',          'DENY');
        $response->headers->set('X-XSS-Protection',         '1; mode=block');
        $response->headers->set('Referrer-Policy',           'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy',        'camera=(), microphone=(), geolocation=()');
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        $response->headers->set(
            'Content-Security-Policy',
            "default-src 'self'; " .
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " .
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " .
            "img-src 'self' data: blob: https:; " .
            "font-src 'self' data: https://fonts.gstatic.com; " .
            "connect-src 'self'; " .
            "frame-ancestors 'none';"
        );

        // Remove server fingerprint headers
        $response->headers->remove('Server');
        $response->headers->remove('X-Powered-By');

        return $response;
    }
}
