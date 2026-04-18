<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomField extends Model
{
    use SoftDeletes;

    protected $fillable = ['module', 'config'];

    protected $casts = [
        'config' => 'array',
    ];
}
