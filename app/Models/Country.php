<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Country extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'code', 'is_active', 'created_by',
        'phone_code', 'currency_code', 'currency_symbol', 'phone_digits',
    ];

    protected $casts = [
        'is_active'    => 'boolean',
        'phone_digits' => 'integer',
    ];

    public function layerSchemas(): HasMany
    {
        return $this->hasMany(LocationLayerSchema::class)->orderBy('depth');
    }

    public function nodes(): HasMany
    {
        return $this->hasMany(DistributionLocationNode::class);
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
