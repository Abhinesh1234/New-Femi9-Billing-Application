<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceApprovalHierarchyLevel extends Model
{
    protected $table = 'invoice_approval_hierarchy';

    protected $fillable = ['level_order', 'user_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
