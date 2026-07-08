<?php

namespace App\ServerCostCalculator\Console;

use App\ServerCostCalculator\Services\MetricsAggregator;
use Illuminate\Console\Command;

class AggregateServerMetrics extends Command
{
    protected $signature = 'scc:aggregate
                            {--window= : Window size in minutes (overrides config)}';

    protected $description = 'Aggregate server metrics and write a cost estimate snapshot';

    public function handle(MetricsAggregator $aggregator): int
    {
        if (! config('server_cost.enabled', true)) {
            $this->info('Server Cost Calculator is disabled (SCC_ENABLED=false).');
            return self::SUCCESS;
        }

        $window = (int) ($this->option('window') ?? config('server_cost.aggregate_every_minutes', 5));

        $this->info("Aggregating last {$window} minute(s) of metrics…");

        try {
            $aggregator->run($window);
            $this->info('Done. Report written to storage/logs/server_cost.log');
        } catch (\Throwable $e) {
            $this->error('Aggregation failed: ' . $e->getMessage());
            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
