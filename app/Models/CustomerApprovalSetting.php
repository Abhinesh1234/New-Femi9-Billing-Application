<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerApprovalSetting extends Model
{
    protected $table = 'customer_approval_settings';

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
}
