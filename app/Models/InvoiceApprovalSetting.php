<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InvoiceApprovalSetting extends Model
{
    protected $fillable = [
        'approval_type',
        'notify_on_submit',
        'notify_who',
        'notify_email',
        'notify_submitter',
    ];

    protected $casts = [
        'notify_on_submit' => 'boolean',
        'notify_submitter' => 'boolean',
    ];

    public function approvers(): HasMany
    {
        return $this->hasMany(InvoiceApprovalApprover::class, 'id', 'id');
    }
}
