<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentAttachment extends Model
{
    protected $fillable = [
        'payment_id', 'original_name', 'storage_path', 'file_size', 'mime_type',
    ];

    protected $appends = ['url'];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function getUrlAttribute(): string
    {
        return '/storage/' . $this->storage_path;
    }
}
