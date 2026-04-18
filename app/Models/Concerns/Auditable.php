<?php

namespace App\Models\Concerns;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Log;

trait Auditable
{
    // Fields never written to audit log
    protected static array $auditExclude = [
        'created_at', 'updated_at', 'deleted_at',
    ];

    // Static map keyed by model primary key — avoids polluting Eloquent's attribute bag
    private static array $pendingOldValues = [];

    public static function bootAuditable(): void
    {
        // Capture old values BEFORE the update is committed
        static::updating(function ($model) {
            $dirty = array_diff_key($model->getDirty(), array_flip(static::$auditExclude));
            static::$pendingOldValues[$model->getKey()] = array_intersect_key($model->getOriginal(), $dirty);
        });

        static::created(function ($model) {
            static::writeAuditLog('created', $model, null, static::auditableAttributes($model));
        });

        static::updated(function ($model) {
            $newValues = array_diff_key($model->getChanges(), array_flip(static::$auditExclude));
            if (empty($newValues)) return; // only timestamps changed — skip
            $oldValues = static::$pendingOldValues[$model->getKey()] ?? [];
            unset(static::$pendingOldValues[$model->getKey()]);
            static::writeAuditLog('updated', $model, $oldValues, $newValues);
        });

        static::deleted(function ($model) {
            static::writeAuditLog('deleted', $model, static::auditableAttributes($model), null);
        });

        if (method_exists(static::class, 'restoring')) {
            static::restored(function ($model) {
                static::writeAuditLog('restored', $model, null, static::auditableAttributes($model));
            });
        }
    }

    private static function auditableAttributes($model): array
    {
        return array_diff_key($model->getAttributes(), array_flip(static::$auditExclude));
    }

    private static function writeAuditLog(string $event, $model, ?array $oldValues, ?array $newValues): void
    {
        try {
            $request = app('request');
            AuditLog::create([
                'auditable_type' => $model->getTable(),
                'auditable_id'   => $model->getKey(),
                'event'          => $event,
                'user_id'        => auth()->id(),
                'ip_address'     => $request?->ip(),
                'user_agent'     => $request?->userAgent(),
                'old_values'     => $oldValues ?: null,
                'new_values'     => $newValues ?: null,
            ]);
        } catch (\Throwable $e) {
            // Audit failure must never break the main operation
            Log::error('[Auditable] Failed to write audit log', [
                'table'   => $model->getTable(),
                'id'      => $model->getKey(),
                'event'   => $event,
                'error'   => $e->getMessage(),
            ]);
        }
    }
}
