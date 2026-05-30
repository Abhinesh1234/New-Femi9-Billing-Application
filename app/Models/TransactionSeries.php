<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class TransactionSeries extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'customer_category',
        'is_system_default',
    ];

    protected $casts = [
        'is_system_default' => 'boolean',
    ];

    public function modulesConfig(): HasOne
    {
        return $this->hasOne(TransactionSeriesModule::class, 'series_id');
    }

}
