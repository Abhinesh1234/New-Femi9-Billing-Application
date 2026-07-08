<?php

/**
 * Server Cost Calculator — AWS & GCP pricing constants (2025/2026 public list prices).
 *
 * All hourly rates → monthly = rate × 730 hours.
 * Deletion: remove ServerCostServiceProvider from bootstrap/providers.php,
 * then delete app/ServerCostCalculator/, database/migrations/server_cost/, config/server_cost.php.
 */
return [

    // ─── Currency ─────────────────────────────────────────────────────────────

    // Update this rate periodically to match the current USD → INR market rate.
    'usd_to_inr' => env('SCC_USD_TO_INR', 84.5),

    // ─── Collection & retention settings ──────────────────────────────────────

    'enabled'                => env('SCC_ENABLED', true),
    'aggregate_every_minutes' => env('SCC_AGGREGATE_MINUTES', 5),
    'raw_retention_days'     => env('SCC_RAW_RETENTION_DAYS', 7),
    'snapshot_retention_days' => env('SCC_SNAPSHOT_RETENTION_DAYS', 90),

    // Factor applied to peak measured RAM when selecting an instance tier.
    // 2.0 = "instance needs at least 2× our peak PHP memory" (OS + DB headroom).
    'ram_headroom_factor' => 2.0,

    // Target CPU utilisation when estimating vCPU requirement (0.0–1.0).
    'cpu_utilisation_target' => 0.70,

    // ─── AWS us-east-1 pricing ─────────────────────────────────────────────────

    'aws' => [
        'region' => 'us-east-1',

        // EC2 on-demand Linux (hourly rate USD)
        // Format: [name, ram_gb, vcpu, hourly_usd]
        'ec2_tiers' => [
            ['name' => 't3.nano',    'ram_gb' => 0.5,  'vcpu' => 2,  'hourly' => 0.0052],
            ['name' => 't3.micro',   'ram_gb' => 1.0,  'vcpu' => 2,  'hourly' => 0.0104],
            ['name' => 't3.small',   'ram_gb' => 2.0,  'vcpu' => 2,  'hourly' => 0.0208],
            ['name' => 't3.medium',  'ram_gb' => 4.0,  'vcpu' => 2,  'hourly' => 0.0416],
            ['name' => 't3.large',   'ram_gb' => 8.0,  'vcpu' => 2,  'hourly' => 0.0832],
            ['name' => 't3.xlarge',  'ram_gb' => 16.0, 'vcpu' => 4,  'hourly' => 0.1664],
            ['name' => 't3.2xlarge', 'ram_gb' => 32.0, 'vcpu' => 8,  'hourly' => 0.3328],
        ],

        // RDS MySQL single-AZ db.t3 (hourly rate USD)
        'rds_tiers' => [
            ['name' => 'db.t3.micro',  'ram_gb' => 1.0, 'vcpu' => 2, 'hourly' => 0.017],
            ['name' => 'db.t3.small',  'ram_gb' => 2.0, 'vcpu' => 2, 'hourly' => 0.034],
            ['name' => 'db.t3.medium', 'ram_gb' => 4.0, 'vcpu' => 2, 'hourly' => 0.068],
            ['name' => 'db.t3.large',  'ram_gb' => 8.0, 'vcpu' => 2, 'hourly' => 0.136],
        ],

        // USD per GB-month (EBS GP3)
        'storage_per_gb_month' => 0.08,

        // USD per GB egress (first 100 GB/month free, then this rate)
        'egress_per_gb'       => 0.09,
        'egress_free_gb'      => 100,

        'hours_per_month' => 730,
    ],

    // ─── GCP us-central1 pricing ──────────────────────────────────────────────

    'gcp' => [
        'region' => 'us-central1',

        // Compute Engine E2 on-demand (hourly rate USD)
        'compute_tiers' => [
            ['name' => 'e2-micro',       'ram_gb' => 1.0,  'vcpu' => 0.25, 'hourly' => 0.0084],
            ['name' => 'e2-small',       'ram_gb' => 2.0,  'vcpu' => 0.5,  'hourly' => 0.0168],
            ['name' => 'e2-medium',      'ram_gb' => 4.0,  'vcpu' => 1.0,  'hourly' => 0.0335],
            ['name' => 'e2-standard-2',  'ram_gb' => 8.0,  'vcpu' => 2.0,  'hourly' => 0.0671],
            ['name' => 'e2-standard-4',  'ram_gb' => 16.0, 'vcpu' => 4.0,  'hourly' => 0.1342],
            ['name' => 'e2-standard-8',  'ram_gb' => 32.0, 'vcpu' => 8.0,  'hourly' => 0.2684],
        ],

        // Cloud SQL PostgreSQL/MySQL (hourly rate USD)
        'cloudsql_tiers' => [
            ['name' => 'db-f1-micro',       'ram_gb' => 0.6,  'vcpu' => 1, 'hourly' => 0.0150],
            ['name' => 'db-g1-small',       'ram_gb' => 1.7,  'vcpu' => 1, 'hourly' => 0.0500],
            ['name' => 'db-n1-standard-1',  'ram_gb' => 3.75, 'vcpu' => 1, 'hourly' => 0.1025],
            ['name' => 'db-n1-standard-2',  'ram_gb' => 7.5,  'vcpu' => 2, 'hourly' => 0.2050],
        ],

        // USD per GB-month (SSD persistent disk)
        'storage_per_gb_month' => 0.17,

        // USD per GB egress (first 1 GB free, then this rate for internet)
        'egress_per_gb' => 0.08,
        'egress_free_gb' => 1,

        'hours_per_month' => 730,
    ],
];
