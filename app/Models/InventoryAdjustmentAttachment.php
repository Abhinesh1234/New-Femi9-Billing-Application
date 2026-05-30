<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryAdjustmentAttachment extends Model
{
    protected $fillable = [
        'adjustment_id',
        'file_name',
        'file_path',
        'mime_type',
        'file_size',
        'uploaded_by',
    ];

    public function adjustment(): BelongsTo
    {
        return $this->belongsTo(InventoryAdjustment::class, 'adjustment_id');
    }
}
