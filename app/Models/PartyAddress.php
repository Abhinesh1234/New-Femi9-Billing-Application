<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartyAddress extends Model
{
    protected $fillable = [
        'party_id',
        'address_type',
        'attention',
        'country_id',
        'street1',
        'street2',
        'city',
        'state',
        'pin_code',
        'phone_code',
        'phone',
        'fax',
    ];

    public function party(): BelongsTo
    {
        return $this->belongsTo(Party::class);
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }
}
