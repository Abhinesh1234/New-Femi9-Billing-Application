<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PriceList extends Model
{
    use SoftDeletes, Auditable;

    protected $fillable = [
        'name',
        'transaction_type',
        'customer_category_id',
        'price_list_type',
        'description',
        'settings',
        'is_active',
        'admin_only',
        'created_by',
    ];

    protected $casts = [
        'settings'   => 'array',
        'is_active'  => 'boolean',
        'admin_only' => 'boolean',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(PriceListItem::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
