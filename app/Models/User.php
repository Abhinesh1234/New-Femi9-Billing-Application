<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;
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
    /**
     * Build a flat [module => [view,create,edit,delete,others]] map once per request.
     * User-specific rows take precedence; falls back to role rows.
     */
    /**
     * Returns null (= full access) only for super_admin with no individual overrides.
     * When individual permission rows exist they ALWAYS take priority, even for super_admin.
     */
    public function permissionCacheKey(): string
    {
        return "user_perms:{$this->id}";
    }

    public function flushPermissionCache(): void
    {
        Cache::forget($this->permissionCacheKey());
    }

    public function computeEffectivePermissions(): ?array
    {
        return Cache::remember($this->permissionCacheKey(), now()->addMinutes(10), function () {
            $this->loadMissing(['userPermissions', 'role.permissions']);

            if ($this->userPermissions->isNotEmpty()) {
                return $this->userPermissions->mapWithKeys(fn ($p) => [
                    $p->module => [
                        'view'        => (bool) $p->can_view,
                        'create'      => (bool) $p->can_create,
                        'edit'        => (bool) $p->can_edit,
                        'delete'      => (bool) $p->can_delete,
                        'others'      => (bool) $p->can_others,
                        'others_data' => $p->others_data,
                    ],
                ])->toArray();
            }

            if ($this->isSuperAdmin()) return null;

            $source = $this->role?->permissions ?? collect();
            return $source->mapWithKeys(fn ($p) => [
                $p->module => [
                    'view'        => (bool) $p->can_view,
                    'create'      => (bool) $p->can_create,
                    'edit'        => (bool) $p->can_edit,
                    'delete'      => (bool) $p->can_delete,
                    'others'      => (bool) $p->can_others,
                    'others_data' => $p->others_data,
                ],
            ])->toArray();
        });
    }

    public function hasPermission(string $action, string $module): bool
    {
        // Super admin with no overrides — skip DB entirely
        if ($this->isSuperAdmin() && !Cache::has($this->permissionCacheKey())) {
            $this->loadMissing('userPermissions');
            if ($this->userPermissions->isEmpty()) return true;
        }

        $perms = $this->computeEffectivePermissions();
        if ($perms === null) return true; // super_admin full access

        return (bool) ($perms[$module][$action] ?? false);
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function role()
    {
        return $this->belongsTo(\App\Models\Role::class, 'role_id');
    }

    public function userPermissions()
    {
        return $this->hasMany(UserPermission::class);
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }
}
