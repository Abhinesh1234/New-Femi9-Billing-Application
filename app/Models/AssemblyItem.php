<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssemblyItem extends Model
{
    protected $fillable = [
        'assembly_id',
        'item_id',
        'item_name',
        'item_unit',
        'quantity_required',
        'total_quantity',
        'cost_price',
    ];

    protected $casts = [
        'quantity_required' => 'decimal:4',
        'total_quantity'    => 'decimal:4',
        'cost_price'        => 'decimal:4',
    ];

    public function assembly(): BelongsTo
    {
        return $this->belongsTo(Assembly::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}
