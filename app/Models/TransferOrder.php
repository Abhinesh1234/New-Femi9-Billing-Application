<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TransferOrder extends Model
{
    use SoftDeletes, Auditable;

    protected $fillable = [
        'transfer_number',
        'transfer_date',
        'source_location_id',
        'destination_location_id',
        'reason',
        'status',
        'initiated_at',
        'initiated_by',
        'transferred_at',
        'transferred_by',
        'cancelled_at',
        'cancelled_by',
        'cancellation_reason',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'transfer_date'   => 'date',
        'initiated_at'    => 'datetime',
        'transferred_at'  => 'datetime',
        'cancelled_at'    => 'datetime',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function lines(): HasMany
    {
        return $this->hasMany(TransferOrderLine::class);
    }

    public function sourceLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'source_location_id');
    }

    public function destinationLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'destination_location_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function initiatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'initiated_by');
    }

    public function transferredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'transferred_by');
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    // ── Status helpers ────────────────────────────────────────────────────────

    public function isDraft(): bool       { return $this->status === 'draft'; }
    public function isInTransit(): bool   { return $this->status === 'in_transit'; }
    public function isTransferred(): bool { return $this->status === 'transferred'; }
    public function isCancelled(): bool   { return $this->status === 'cancelled'; }

    public function isEditable(): bool
    {
        return $this->isDraft();
    }

    public function canInitiate(): bool
    {
        return $this->isDraft();
    }

    public function canTransfer(): bool
    {
        return $this->isInTransit();
    }

    public function canCancel(): bool
    {
        return in_array($this->status, ['draft', 'in_transit', 'transferred']);
    }
}
