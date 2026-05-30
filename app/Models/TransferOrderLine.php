<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransferOrderLine extends Model
{
    protected $fillable = [
        'transfer_order_id',
        'item_id',
        'qty_to_transfer',
        'source_qty_snapshot',
        'dest_qty_snapshot',
        'description',
    ];

    protected $casts = [
        'qty_to_transfer'     => 'float',
        'source_qty_snapshot' => 'float',
        'dest_qty_snapshot'   => 'float',
    ];

    public function transferOrder(): BelongsTo
    {
        return $this->belongsTo(TransferOrder::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}
