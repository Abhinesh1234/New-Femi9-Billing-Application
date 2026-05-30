<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_system' => 'boolean',
    ];

    public function permissions(): HasMany
    {
        return $this->hasMany(RolePermission::class, 'role_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
