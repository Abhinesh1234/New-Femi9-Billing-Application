<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;

class Party extends Model
{
    use SoftDeletes;

    protected $hidden = ['laravel_through_key'];

    protected $fillable = [
        'party_id',
        'party_id_history',
        'party_type',
        'salutation',
        'first_name',
        'last_name',
        'company_name',
        'display_name',
        'email',
        'work_phone_code',
        'work_phone',
        'mobile_code',
        'mobile',
        'language',
        'distribution_category_id',
        'distribution_sub_category_id',
        'parent_party_id',
        'pan',
        'gst',
        'account_number',
        'ifsc_code',
        'upi_number',
        'currency',
        'payment_terms',
        'enable_portal',
        'location_type',
        'role_id',
        'permissions',
        'is_active',
        'approval_status',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'party_image',
        'remarks',
        'contact_persons',
        'custom_fields',
        'documents',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'enable_portal'    => 'boolean',
        'is_active'        => 'boolean',
        'party_id_history' => 'array',
        'contact_persons'  => 'array',
        'custom_fields'    => 'array',
        'documents'        => 'array',
        'permissions'      => 'array',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Party::class, 'parent_party_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Party::class, 'parent_party_id');
    }

    /** Returns all descendant party IDs (self + children + grandchildren…) via recursive CTE. */
    public function descendantIds(): array
    {
        $rows = DB::select("
            WITH RECURSIVE descendants AS (
                SELECT id FROM parties WHERE id = ? AND deleted_at IS NULL
                UNION ALL
                SELECT p.id FROM parties p
                INNER JOIN descendants d ON p.parent_party_id = d.id
                WHERE p.deleted_at IS NULL
            )
            SELECT id FROM descendants
        ", [$this->id]);

        return array_column($rows, 'id');
    }

    public function distributionCategory(): BelongsTo
    {
        return $this->belongsTo(DistributionCategory::class, 'distribution_category_id');
    }

    public function distributionSubCategory(): BelongsTo
    {
        return $this->belongsTo(DistributionSubCategory::class, 'distribution_sub_category_id');
    }

    public function billingAddress(): HasOne
    {
        return $this->hasOne(PartyAddress::class)->where('address_type', 'billing');
    }

    public function shippingAddress(): HasOne
    {
        return $this->hasOne(PartyAddress::class)->where('address_type', 'shipping');
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(PartyAddress::class);
    }

    public function locations(): HasMany
    {
        return $this->hasMany(PartyLocation::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
