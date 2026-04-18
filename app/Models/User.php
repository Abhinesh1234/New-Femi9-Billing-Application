<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Builder;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes, HasApiTokens;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'avatar',
        'password',
        'user_type',
        'is_active',
        'permissions',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
            'permissions'       => 'array',
        ];
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOfType(Builder $query, ?string $type): Builder
    {
        return $type ? $query->where('user_type', $type) : $query;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function isSuperAdmin(): bool
    {
        return $this->user_type === 'super_admin';
    }

    public function isAdmin(): bool
    {
        return in_array($this->user_type, ['super_admin', 'admin']);
    }

    /**
     * Check if user has a specific permission for a module.
     * Falls back to role-based defaults if no override set.
     * Usage: $user->can('create', 'items')
     */
    public function hasPermission(string $action, string $module): bool
    {
        // Super admin always has full access
        if ($this->isSuperAdmin()) return true;

        // Check JSON permission overrides
        $perms = $this->permissions ?? [];
        if (isset($perms[$module][$action])) {
            return (bool) $perms[$module][$action];
        }

        // Role-based defaults
        return match ($this->user_type) {
            'admin' => in_array($action, ['view', 'create', 'edit', 'delete']),
            'staff' => $action === 'view',
            default => false,
        };
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }
}
