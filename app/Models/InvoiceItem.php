<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends Model
{
    protected $fillable = [
        'invoice_id', 'item_id', 'item_name', 'pricelist_id',
        'quantity', 'unit_price', 'base_rate',
        'gst_rate', 'gst_amount', 'amount',
        'sort_order',
    ];

    protected $casts = [
        'quantity'   => 'decimal:4',
        'unit_price' => 'decimal:4',
        'base_rate'  => 'decimal:4',
        'gst_rate'   => 'decimal:4',
        'gst_amount' => 'decimal:2',
        'amount'     => 'decimal:2',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class)->withTrashed();
    }
}
