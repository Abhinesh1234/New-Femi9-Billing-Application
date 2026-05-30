<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DistributionSubCategory extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'distribution_category_id',
        'description',
        'status',
        'target_amount',
        'cashback_referral',
        'parent_id',
        'level',
        'linked_location_country_id',
        'linked_location_node_id',
        'portal_access',
        'visible_in_hierarchy',
    ];

    protected $casts = [
        'portal_access'        => 'boolean',
        'visible_in_hierarchy' => 'boolean',
    ];

    public function distributionCategory(): BelongsTo
    {
        return $this->belongsTo(DistributionCategory::class, 'distribution_category_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(DistributionSubCategory::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(DistributionSubCategory::class, 'parent_id');
    }

    public function linkedCountry(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'linked_location_country_id');
    }

    public function linkedNode(): BelongsTo
    {
        return $this->belongsTo(DistributionLocationNode::class, 'linked_location_node_id');
    }
}
