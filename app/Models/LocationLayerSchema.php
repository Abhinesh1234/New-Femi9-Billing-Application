<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LocationLayerSchema extends Model
{
    protected $fillable = ['country_id', 'depth', 'layer_name', 'parent_node_id'];

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }
}
