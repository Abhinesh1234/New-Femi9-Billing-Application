<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentApplication extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'payment_id', 'invoice_id', 'applied_amount', 'applied_at', 'applied_by',
    ];

    protected $casts = [
        'applied_amount' => 'decimal:2',
        'applied_at'     => 'datetime',
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
