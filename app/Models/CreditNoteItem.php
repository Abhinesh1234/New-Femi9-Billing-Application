<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CreditNoteItem extends Model
{
    protected $fillable = [
        'credit_note_id', 'item_id',
        'item_name', 'quantity', 'unit_price', 'base_rate',
        'gst_rate', 'gst_amount', 'amount', 'sort_order',
    ];

    protected $casts = [
        'quantity'   => 'decimal:4',
        'unit_price' => 'decimal:4',
        'base_rate'  => 'decimal:4',
        'gst_rate'   => 'decimal:4',
        'gst_amount' => 'decimal:2',
        'amount'     => 'decimal:2',
    ];

    public function creditNote(): BelongsTo
    {
        return $this->belongsTo(CreditNote::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class)->withTrashed();
    }
}
