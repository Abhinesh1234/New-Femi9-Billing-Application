<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppNotification extends Model
{
    protected $fillable = [
        'notifiable_type',
        'notifiable_id',
        'type',
        'title',
        'body',
        'data',
        'read_at',
    ];

    protected $casts = [
        'data'    => 'array',
        'read_at' => 'datetime',
    ];

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }
}
