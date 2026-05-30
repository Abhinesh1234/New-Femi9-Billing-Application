<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerApprovalApprover extends Model
{
    protected $table = 'customer_approval_approvers';

    protected $fillable = ['user_id', 'sort_order'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
