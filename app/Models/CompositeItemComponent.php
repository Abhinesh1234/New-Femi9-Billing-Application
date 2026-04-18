<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompositeItemComponent extends Model
{
    protected $fillable = [
        'composite_item_id',
        'component_item_id',
        'component_type',
        'quantity',
        'selling_price',
        'cost_price',
        'sort_order',
    ];

    protected $casts = [
        'quantity'      => 'decimal:4',
        'selling_price' => 'decimal:4',
        'cost_price'    => 'decimal:4',
        'sort_order'    => 'integer',
    ];

    public function compositeItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'composite_item_id');
    }

    public function componentItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'component_item_id');
    }
}
