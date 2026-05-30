<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RolePermission extends Model
{
    protected $fillable = [
        'role_id',
        'module',
        'can_view',
        'can_create',
        'can_edit',
        'can_delete',
        'can_others',
        'others_data',
    ];

    protected $casts = [
        'can_view'    => 'boolean',
        'can_create'  => 'boolean',
        'can_edit'    => 'boolean',
        'can_delete'  => 'boolean',
        'can_others'  => 'boolean',
        'others_data' => 'array',
    ];

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }
}
