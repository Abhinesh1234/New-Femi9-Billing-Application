<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class DistributionLocationNode extends Model
{
    use SoftDeletes;

    protected $fillable = ['country_id', 'parent_id', 'depth', 'name', 'code', 'is_active', 'created_by'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(DistributionLocationNode::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(DistributionLocationNode::class, 'parent_id');
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (!$term) return $query;
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('code', 'like', "%{$term}%");
        });
    }
}
