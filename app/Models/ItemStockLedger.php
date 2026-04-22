<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemStockLedger extends Model
{
    protected $table = 'item_stock_ledger';

    // Append-only — no updated_at
    public $timestamps  = false;
    const CREATED_AT    = 'created_at';

    protected $fillable = [
        'item_id',
        'location_id',
        'transaction_type',
        'transaction_date',
        'reference_type',
        'reference_id',
        'qty_change',
        'committed_change',
        'unit_value',
        'stock_on_hand_after',
        'committed_after',
        'available_after',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'transaction_date'    => 'date',
        'qty_change'          => 'decimal:4',
        'committed_change'    => 'decimal:4',
        'unit_value'          => 'decimal:4',
        'stock_on_hand_after' => 'decimal:4',
        'committed_after'     => 'decimal:4',
        'available_after'     => 'decimal:4',
        'created_at'          => 'datetime',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
