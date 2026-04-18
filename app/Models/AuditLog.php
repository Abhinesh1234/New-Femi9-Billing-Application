<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    // Immutable — only created_at, no updated_at
    public $timestamps  = false;
    const CREATED_AT    = 'created_at';

    protected $fillable = [
        'auditable_type',
        'auditable_id',
        'event',
        'user_id',
        'ip_address',
        'user_agent',
        'old_values',
        'new_values',
    ];

    protected $casts = [
        'old_values'  => 'array',
        'new_values'  => 'array',
        'created_at'  => 'datetime',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeForModel($query, string $type, int $id)
    {
        return $query->where('auditable_type', $type)->where('auditable_id', $id);
    }

    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeEvent($query, string $event)
    {
        return $query->where('event', $event);
    }
}
