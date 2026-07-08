<?php

namespace App\ServerCostCalculator\Providers;

use App\ServerCostCalculator\Console\AggregateServerMetrics;
use App\ServerCostCalculator\Http\Middleware\CollectRequestMetrics;
use App\ServerCostCalculator\Services\MetricsAggregator;
use App\ServerCostCalculator\Services\ServerCostEstimator;
use App\ServerCostCalculator\Services\SystemMetricsCollector;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\ServiceProvider;

/**
 * Single registration point for the Server Cost Calculator module.
 *
 * To remove the module entirely:
 *   1. Delete this entry from bootstrap/providers.php
 *   2. Delete: app/ServerCostCalculator/
 *              database/migrations/server_cost/
 *              config/server_cost.php
 *   3. Drop the DB tables: scc_request_metrics, scc_cost_snapshots
 */
class ServerCostServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            base_path('config/server_cost.php'),
            'server_cost'
        );

        $this->app->singleton(SystemMetricsCollector::class);

        $this->app->singleton(ServerCostEstimator::class);

        $this->app->singleton(MetricsAggregator::class, function ($app) {
            return new MetricsAggregator(
                $app->make(SystemMetricsCollector::class),
                $app->make(ServerCostEstimator::class),
            );
        });
    }

    public function boot(): void
    {
        // Load migrations from the isolated subfolder.
        $this->loadMigrationsFrom(base_path('database/migrations/server_cost'));

        // Register the Artisan command.
        if ($this->app->runningInConsole()) {
            $this->commands([AggregateServerMetrics::class]);
        }

        // Attach the middleware to the 'api' group so it wraps every API request.
        $this->app['router']->pushMiddlewareToGroup('api', CollectRequestMetrics::class);

        // Schedule the aggregation command every N minutes (from config).
        $this->callAfterResolving(Schedule::class, function (Schedule $schedule) {
            $every = (int) config('server_cost.aggregate_every_minutes', 5);
            $schedule->command(AggregateServerMetrics::class)
                ->everyMinutes($every)
                ->withoutOverlapping()
                ->runInBackground();
        });
    }
}
