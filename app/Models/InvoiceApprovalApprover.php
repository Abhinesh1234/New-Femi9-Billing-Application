<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceApprovalApprover extends Model
{
    protected $fillable = ['user_id', 'sort_order'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
