<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionSeriesModule extends Model
{
    protected $table = 'transaction_series_modules';

    protected $fillable = [
        'series_id',
        'modules',
    ];

    protected $casts = [
        'modules' => 'array',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function series(): BelongsTo
    {
        return $this->belongsTo(TransactionSeries::class, 'series_id');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Get a specific module config by name */
    public function getModule(string $moduleName): ?array
    {
        return collect($this->modules)
            ->firstWhere('module', $moduleName);
    }

    /** Update a single module's fields without touching others */
    public function updateModule(string $moduleName, array $fields): void
    {
        $this->modules = collect($this->modules)->map(function ($m) use ($moduleName, $fields) {
            return $m['module'] === $moduleName ? array_merge($m, $fields) : $m;
        })->values()->all();

        $this->save();
    }
}
