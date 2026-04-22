<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemStock extends Model
{
    protected $table = 'item_stock';

    protected $fillable = [
        'item_id',
        'location_id',
        'stock_on_hand',
        'committed_stock',
        'available_for_sale',
    ];

    protected $casts = [
        'stock_on_hand'      => 'decimal:4',
        'committed_stock'    => 'decimal:4',
        'available_for_sale' => 'decimal:4',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
}
