<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CreditApplication extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'customer_credit_id', 'invoice_id',
        'applied_amount', 'applied_at', 'applied_by',
    ];

    protected $casts = [
        'applied_amount' => 'decimal:2',
        'applied_at'     => 'datetime',
    ];

    public function customerCredit(): BelongsTo
    {
        return $this->belongsTo(CustomerCredit::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class)->withTrashed();
    }
}
