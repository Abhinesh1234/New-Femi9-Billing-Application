<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentRefund extends Model
{
    protected $fillable = [
        'payment_id', 'amount', 'refunded_on', 'payment_mode',
        'reference_number', 'from_account_id', 'description', 'created_by',
    ];

    protected $casts = ['refunded_on' => 'date:Y-m-d', 'amount' => 'decimal:2'];

    public function payment(): BelongsTo  { return $this->belongsTo(Payment::class); }
    public function fromAccount(): BelongsTo { return $this->belongsTo(Account::class, 'from_account_id'); }
    public function creator(): BelongsTo  { return $this->belongsTo(User::class, 'created_by'); }
}
