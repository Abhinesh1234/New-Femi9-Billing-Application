<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PartyComment extends Model
{
    use SoftDeletes;

    protected $fillable = ['party_id', 'user_id', 'content'];

    public function party(): BelongsTo
    {
        return $this->belongsTo(Party::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
