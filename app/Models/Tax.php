<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tax extends Model
{
    protected $fillable = ['name', 'rate'];

    protected $casts = [
        'rate' => 'decimal:4',
    ];
}
