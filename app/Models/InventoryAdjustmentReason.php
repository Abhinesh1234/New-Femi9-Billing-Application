<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryAdjustmentReason extends Model
{
    protected $fillable = ['name', 'sort_order', 'created_by'];

    public function adjustments(): HasMany
    {
        return $this->hasMany(InventoryAdjustment::class, 'reason_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
