<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceListItem extends Model
{
    protected $fillable = [
        'price_list_id',
        'item_id',
        'custom_rate',
        'discount',
        'volume_ranges',
    ];

    protected $casts = [
        'custom_rate'   => 'decimal:4',
        'discount'      => 'decimal:2',
        'volume_ranges' => 'array',
    ];

    public function priceList(): BelongsTo
    {
        return $this->belongsTo(PriceList::class);
    }
}
