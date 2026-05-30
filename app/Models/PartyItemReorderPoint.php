<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartyItemReorderPoint extends Model
{
    protected $fillable = [
        'party_id',
        'item_id',
        'reorder_point',
        'last_notified_at',
    ];

    protected $casts = [
        'reorder_point'    => 'decimal:4',
        'last_notified_at' => 'datetime',
    ];

    public function party(): BelongsTo
    {
        return $this->belongsTo(Party::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}
