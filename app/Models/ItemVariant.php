<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemVariant extends Model
{
    use SoftDeletes, Auditable;

    protected $fillable = [
        'item_id', 'combo_key', 'name', 'sku',
        'cost_price', 'selling_price', 'image', 'sort_order',
    ];

    protected $casts = [
        'cost_price'    => 'decimal:4',
        'selling_price' => 'decimal:4',
        'sort_order'    => 'integer',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}
