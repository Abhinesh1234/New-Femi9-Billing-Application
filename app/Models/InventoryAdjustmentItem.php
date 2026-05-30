<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryAdjustmentItem extends Model
{
    protected $fillable = [
        'adjustment_id',
        'item_id',
        'item_name',
        'item_sku',
        'item_unit',
        'cost_price',
        'qty_available',
        'new_qty_on_hand',
        'qty_adjusted',
        'sort_order',
    ];

    protected $casts = [
        'cost_price'      => 'float',
        'qty_available'   => 'float',
        'new_qty_on_hand' => 'float',
        'qty_adjusted'    => 'float',
    ];

    public function adjustment(): BelongsTo
    {
        return $this->belongsTo(InventoryAdjustment::class, 'adjustment_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id');
    }
}
