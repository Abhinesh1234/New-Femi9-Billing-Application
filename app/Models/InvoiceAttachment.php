<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceAttachment extends Model
{
    protected $fillable = [
        'invoice_id', 'original_name', 'storage_path', 'file_size', 'mime_type',
    ];

    protected $appends = ['url'];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function getUrlAttribute(): string
    {
        return '/storage/' . $this->storage_path;
    }
}
