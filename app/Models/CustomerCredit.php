<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CustomerCredit extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'customer_id', 'credit_note_id',
        'amount', 'unused_amount', 'status',
        'created_by',
    ];

    protected $casts = [
        'amount'        => 'decimal:2',
        'unused_amount' => 'decimal:2',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Party::class, 'customer_id')->withTrashed();
    }

    public function creditNote(): BelongsTo
    {
        return $this->belongsTo(CreditNote::class)->withTrashed();
    }

    public function applications(): HasMany
    {
        return $this->hasMany(CreditApplication::class);
    }

    public function recalculateUnused(): void
    {
        $used = (float) $this->applications()->sum('applied_amount');
        $this->updateQuietly([
            'unused_amount' => max(0, (float) $this->amount - $used),
            'status'        => $used >= (float) $this->amount ? 'closed' : 'open',
        ]);
    }
}
