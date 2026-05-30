<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Invoice extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'invoice_number', 'status',
        'customer_id', 'location_id', 'series_id', 'reference_id', 'pricelist_id',
        'order_number', 'invoice_date', 'payment_terms', 'due_date', 'salesperson',
        'sub_total',
        'discount_type', 'discount_value', 'discount_amount',
        'tax_type', 'tax_id', 'tax_rate', 'tax_amount',
        'charges_json', 'total_charges',
        'grand_total',
        'total_paid', 'credit_applied', 'balance_amount',
        'customer_notes', 'terms_conditions',
        'created_by', 'updated_by',
    ];

    protected $casts = [
        'invoice_date'    => 'date',
        'due_date'        => 'date',
        'charges_json'    => 'array',
        'sub_total'       => 'decimal:2',
        'discount_value'  => 'decimal:4',
        'discount_amount' => 'decimal:2',
        'tax_rate'        => 'decimal:4',
        'tax_amount'      => 'decimal:2',
        'total_charges'   => 'decimal:2',
        'grand_total'     => 'decimal:2',
        'total_paid'      => 'decimal:2',
        'credit_applied'  => 'decimal:2',
        'balance_amount'  => 'decimal:2',
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

    public function reference(): BelongsTo
    {
        return $this->belongsTo(InvoiceReference::class);
    }

    public function tax(): BelongsTo
    {
        return $this->belongsTo(Tax::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class)->orderBy('sort_order');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(InvoiceAttachment::class);
    }

    public function paymentApplications(): HasMany
    {
        return $this->hasMany(PaymentApplication::class);
    }

    public function creditApplications(): HasMany
    {
        return $this->hasMany(CreditApplication::class);
    }

    public function payments(): BelongsToMany
    {
        return $this->belongsToMany(Payment::class, 'payment_applications')
                    ->withPivot('applied_amount', 'applied_at', 'applied_by');
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeSearch($query, ?string $term)
    {
        if (!$term) return $query;
        return $query->where(function ($q) use ($term) {
            $q->where('invoice_number', 'like', "%{$term}%")
              ->orWhere('order_number', 'like', "%{$term}%");
        });
    }

    public function scopeOfStatus($query, ?string $status)
    {
        return $status ? $query->where('status', $status) : $query;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function recalculatePayments(): void
    {
        $totalPaid     = (float) $this->paymentApplications()->sum('applied_amount');
        $creditApplied = (float) $this->creditApplications()->sum('applied_amount');
        $settled       = $totalPaid + $creditApplied;
        $balanceAmount = (float) $this->grand_total - $settled;
        $status = match (true) {
            $balanceAmount <= 0 => 'paid',
            $settled > 0        => 'partially_paid',
            default             => $this->status === 'draft' ? 'draft' : 'sent',
        };
        $this->updateQuietly([
            'total_paid'     => $totalPaid,
            'credit_applied' => $creditApplied,
            'balance_amount' => max(0, $balanceAmount),
            'status'         => $status,
        ]);
    }
}
