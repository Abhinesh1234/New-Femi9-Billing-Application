<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Payment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'payment_number', 'status',
        'customer_id', 'location_id', 'series_id',
        'payment_date', 'amount', 'unused_amount',
        'bank_charges', 'tax_deducted',
        'payment_mode', 'reference_number', 'notes',
        'source',
        'created_by', 'updated_by',
    ];

    protected $casts = [
        'payment_date'  => 'date',
        'amount'        => 'decimal:2',
        'unused_amount' => 'decimal:2',
        'bank_charges'  => 'decimal:2',
        'tax_deducted'  => 'boolean',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Party::class, 'customer_id')->withTrashed();
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class)->withTrashed();
    }

    public function applications(): HasMany
    {
        return $this->hasMany(PaymentApplication::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(PaymentAttachment::class);
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(PaymentRefund::class);
    }

    public function invoices(): BelongsToMany
    {
        return $this->belongsToMany(Invoice::class, 'payment_applications')
                    ->withPivot('applied_amount', 'applied_at', 'applied_by');
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeSearch($query, ?string $term)
    {
        if (!$term) return $query;
        return $query->where(function ($q) use ($term) {
            $q->where('payment_number', 'like', "%{$term}%")
              ->orWhere('reference_number', 'like', "%{$term}%");
        });
    }

    public function scopeForCustomer($query, ?int $customerId)
    {
        return $customerId ? $query->where('customer_id', $customerId) : $query;
    }

    public function scopeForCustomers($query, array $customerIds)
    {
        return !empty($customerIds) ? $query->whereIn('customer_id', $customerIds) : $query;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function recalculateUnused(): void
    {
        $used         = (float) $this->applications()->sum('applied_amount');
        $refunded     = (float) $this->refunds()->sum('amount');
        $unusedAmount = max(0, (float) $this->amount - $used - $refunded);
        $this->updateQuietly([
            'unused_amount' => $unusedAmount,
            'status'        => $unusedAmount <= 0 ? 'closed' : 'open',
        ]);
    }
}
