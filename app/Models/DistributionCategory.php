<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DistributionCategory extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'parent_id',
        'level',
        'linked_location_country_id',
        'linked_location_node_id',
        'linked_location_depth',
        'portal_access',
        'visible_in_hierarchy',
        'party_type',
        'is_system',
        'role_id',
    ];

    protected $casts = [
        'portal_access'          => 'boolean',
        'visible_in_hierarchy'   => 'boolean',
        'linked_location_depth'  => 'integer',
        'is_system'              => 'boolean',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(DistributionCategory::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(DistributionCategory::class, 'parent_id');
    }

    public function linkedCountry(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'linked_location_country_id');
    }

    public function linkedNode(): BelongsTo
    {
        return $this->belongsTo(DistributionLocationNode::class, 'linked_location_node_id');
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }
}
