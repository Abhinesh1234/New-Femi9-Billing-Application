<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PartyIdSequence extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'sequence_key',
        'prefix',
        'last_number',
        'pad_length',
        'updated_at',
    ];

    protected $casts = [
        'last_number' => 'integer',
        'pad_length'  => 'integer',
        'updated_at'  => 'datetime',
    ];
}
