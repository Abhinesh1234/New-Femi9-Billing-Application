<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CreditNote extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'credit_note_number', 'status',
        'customer_id', 'location_id', 'series_id', 'source_invoice_id',
        'credit_note_date', 'salesperson',
        'sub_total',
        'discount_type', 'discount_value', 'discount_amount',
        'tax_type', 'tax_id', 'tax_rate', 'tax_amount',
        'charges_json', 'total_charges',
        'grand_total',
        'customer_notes', 'terms_conditions',
        'created_by', 'updated_by',
    ];

    protected $casts = [
        'credit_note_date' => 'date',
        'charges_json'     => 'array',
        'sub_total'        => 'decimal:2',
        'discount_value'   => 'decimal:4',
        'discount_amount'  => 'decimal:2',
        'tax_rate'         => 'decimal:4',
        'tax_amount'       => 'decimal:2',
        'total_charges'    => 'decimal:2',
        'grand_total'      => 'decimal:2',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Party::class, 'customer_id')->withTrashed();
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class)->withTrashed();
    }

    public function sourceInvoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class, 'source_invoice_id')->withTrashed();
    }

    public function tax(): BelongsTo
    {
        return $this->belongsTo(Tax::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CreditNoteItem::class)->orderBy('sort_order');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(CreditNoteAttachment::class);
    }

    public function customerCredit(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(CustomerCredit::class);
    }
}
