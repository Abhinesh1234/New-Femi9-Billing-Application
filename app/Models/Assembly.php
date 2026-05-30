<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Assembly extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'assembly_number',
        'composite_item_id',
        'location_id',
        'assembled_date',
        'quantity_to_assemble',
        'description',
        'status',
        'created_by',
        'cancelled_by',
        'cancelled_at',
    ];

    protected $casts = [
        'assembled_date'       => 'date',
        'quantity_to_assemble' => 'decimal:4',
        'cancelled_at'         => 'datetime',
    ];

    public function compositeItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'composite_item_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(AssemblyItem::class);
    }
}
