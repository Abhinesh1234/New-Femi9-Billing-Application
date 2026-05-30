<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use App\Models\Party;

class Location extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'party_id',
        'distribution_location_node_id',
        'name',
        'type',
        'parent_id',
        'logo_type',
        'logo_path',
        'website_url',
        'primary_contact_id',
        'txn_series_id',
        'default_txn_series_id',
        'address',
        'shipping_address',
        'access_users',
        'is_active',
        'is_primary',
        'created_by',
    ];

    protected $casts = [
        'address'          => 'array',
        'shipping_address' => 'array',
        'access_users'     => 'array',
        'is_active'    => 'boolean',
        'is_primary'   => 'boolean',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function party(): BelongsTo
    {
        return $this->belongsTo(Party::class, 'party_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Location::class, 'parent_id');
    }

    public function txnSeries(): BelongsTo
    {
        return $this->belongsTo(TransactionSeries::class, 'txn_series_id');
    }

    public function defaultTxnSeries(): BelongsTo
    {
        return $this->belongsTo(TransactionSeries::class, 'default_txn_series_id');
    }

    public function distributionLocationNode(): BelongsTo
    {
        return $this->belongsTo(DistributionLocationNode::class, 'distribution_location_node_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOfType(Builder $query, ?string $type): Builder
    {
        return $type ? $query->where('type', $type) : $query;
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        return $term
            ? $query->where('name', 'like', "%{$term}%")
            : $query;
    }
}
