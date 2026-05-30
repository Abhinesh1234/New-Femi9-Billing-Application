<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerActivityLog extends Model
{
    public $timestamps  = false;
    const CREATED_AT    = 'created_at';

    protected $fillable = [
        'customer_id',
        'event_type',
        'subject_type',
        'subject_id',
        'related_type',
        'related_id',
        'amount',
        'metadata',
        'performed_by',
    ];

    protected $casts = [
        'amount'     => 'decimal:2',
        'metadata'   => 'array',
        'created_at' => 'datetime',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Party::class, 'customer_id');
    }

    public function performer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeForCustomer($query, int $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    public function scopeForSubject($query, string $type, int $id)
    {
        return $query->where('subject_type', $type)->where('subject_id', $id);
    }

    public function scopeLatestFirst($query)
    {
        return $query->orderByDesc('created_at')->orderByDesc('id');
    }
}
