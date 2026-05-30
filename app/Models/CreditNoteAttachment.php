<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CreditNoteAttachment extends Model
{
    protected $fillable = [
        'credit_note_id', 'file_name', 'file_path',
        'mime_type', 'file_size', 'uploaded_by',
    ];

    public function creditNote(): BelongsTo
    {
        return $this->belongsTo(CreditNote::class);
    }
}
