<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HsnCode extends Model
{
    use SoftDeletes, Auditable;

    protected $fillable = ['code', 'description'];

    public function items(): HasMany
    {
        return $this->hasMany(Item::class);
    }
}
