<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartyLocation extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'party_id',
        'location_node_id',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function party(): BelongsTo
    {
        return $this->belongsTo(Party::class);
    }

    public function locationNode(): BelongsTo
    {
        return $this->belongsTo(DistributionLocationNode::class, 'location_node_id');
    }
}
