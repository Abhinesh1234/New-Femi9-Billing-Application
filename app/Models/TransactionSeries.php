<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TransactionSeries extends Model
{
    protected $fillable = [
        'name',
    ];

    public function modulesConfig(): HasOne
    {
        return $this->hasOne(TransactionSeriesModule::class, 'series_id');
    }
}
