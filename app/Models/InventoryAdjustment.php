<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryAdjustment extends Model
{
    use SoftDeletes, Auditable;

    protected $fillable = [
        'reference_number',
        'adjustment_date',
        'reason_id',
        'reason_name',
        'location_id',
        'party_id',
        'description',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'adjustment_date' => 'date',
    ];

    public function reason(): BelongsTo
    {
        return $this->belongsTo(InventoryAdjustmentReason::class, 'reason_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'location_id');
    }

    public function party(): BelongsTo
    {
        return $this->belongsTo(Party::class, 'party_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(InventoryAdjustmentItem::class, 'adjustment_id')->orderBy('sort_order');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(InventoryAdjustmentAttachment::class, 'adjustment_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
