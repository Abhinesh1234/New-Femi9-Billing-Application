<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Security headers on every response (web + api)
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);
        $middleware->prependToGroup('api', \App\Http\Middleware\LogApiActivity::class);

        // Named alias — used as 'scope.party' in route groups after auth:sanctum
        $middleware->alias([
            'scope.party' => \App\Http\Middleware\ScopeToParty::class,
            'perm'        => \App\Http\Middleware\CheckPermission::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // API requests that miss a model binding → JSON 404 instead of HTML redirect
        $exceptions->render(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Record not found.'], 404);
            }
        });
    })->create();
