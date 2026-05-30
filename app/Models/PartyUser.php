<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class PartyUser extends Authenticatable
{
    use HasFactory, SoftDeletes, HasApiTokens;

    protected $table = 'party_users';

    protected $fillable = [
        'party_id',
        'role_id',
        'name',
        'username',
        'email',
        'mobile',
        'password',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = ['password'];

    protected function casts(): array
    {
        return [
            'password'      => 'hashed',
            'is_active'     => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    // Ensures that when a PartyUser is resolved via the company Sanctum guard
    // (e.g. on refresh after handleSwitchCategory stores the party token as
    // auth_token), the company me() endpoint still returns user_type = "party"
    // so the frontend isParty check stays correct.
    public function getUserTypeAttribute(): string
    {
        return 'party';
    }

    public function party(): BelongsTo
    {
        return $this->belongsTo(Party::class);
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Returns a [module => [view,create,edit,delete,others]] map based on the
     * assigned role. Party users have no individual permission overrides —
     * everything comes from their role. No role = empty map (no access).
     */
    public function computeEffectivePermissions(): ?array
    {
        $this->loadMissing('role.permissions');

        $rolePerms = $this->role?->permissions ?? collect();

        if ($rolePerms->isEmpty()) {
            return [];
        }

        return $rolePerms->mapWithKeys(fn ($p) => [
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

    public function hasPermission(string $action, string $module): bool
    {
        $perms = $this->computeEffectivePermissions();
        return (bool) ($perms[$module][$action] ?? false);
    }
}
