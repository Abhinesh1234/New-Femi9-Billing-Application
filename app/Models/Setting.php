<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = ['module', 'configuration'];

    protected $casts = [
        'configuration' => 'array',
    ];

    /**
     * Retrieve configuration for a given module.
     */
    public static function getForModule(string $module): ?array
    {
        return static::where('module', $module)->first()?->configuration;
    }
}
