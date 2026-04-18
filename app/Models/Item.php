<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Item extends Model
{
    use SoftDeletes, Auditable;

    protected $fillable = [
        'name', 'item_type', 'form_type', 'unit', 'sku', 'description', 'image',
        'refs', 'product_tag',
        'has_sales_info', 'selling_price', 'sales_description',
        'has_purchase_info', 'cost_price', 'purchase_description', 'preferred_vendor',
        'track_inventory', 'valuation_method', 'reorder_point',
        'is_returnable', 'dimensions', 'weight', 'identifiers',
        'variation_config', 'custom_fields',
        'is_composite', 'composite_type',
    ];

    protected $casts = [
        'refs'             => 'array',
        'dimensions'       => 'array',
        'weight'           => 'array',
        'identifiers'      => 'array',
        'variation_config' => 'array',
        'custom_fields'    => 'array',
        'has_sales_info'   => 'boolean',
        'has_purchase_info'=> 'boolean',
        'track_inventory'  => 'boolean',
        'is_returnable'    => 'boolean',
        'is_composite'     => 'boolean',
        'selling_price'    => 'decimal:4',
        'cost_price'       => 'decimal:4',
        'reorder_point'    => 'integer',
    ];

    // ── refs-based accessors (all FK lookups via refs JSON) ──────────────────

    public function brand(): ?Brand
    {
        $id = $this->refs['brand_id'] ?? null;
        return $id ? Brand::withTrashed()->find($id) : null;
    }

    public function category(): ?Category
    {
        $id = $this->refs['category_id'] ?? null;
        return $id ? Category::withTrashed()->find($id) : null;
    }

    public function hsnCode(): ?HsnCode
    {
        $id = $this->refs['hsn_code_id'] ?? null;
        return $id ? HsnCode::withTrashed()->find($id) : null;
    }

    public function gstRate(): ?GstRate
    {
        $id = $this->refs['gst_rate_id'] ?? null;
        return $id ? GstRate::withTrashed()->find($id) : null;
    }

    public function salesAccount(): ?Account
    {
        $id = $this->refs['sales_account_id'] ?? null;
        return $id ? Account::withTrashed()->find($id) : null;
    }

    public function purchaseAccount(): ?Account
    {
        $id = $this->refs['purchase_account_id'] ?? null;
        return $id ? Account::withTrashed()->find($id) : null;
    }

    public function inventoryAccount(): ?Account
    {
        $id = $this->refs['inventory_account_id'] ?? null;
        return $id ? Account::withTrashed()->find($id) : null;
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ItemVariant::class)->orderBy('sort_order');
    }

    /** Components that make up this composite item. */
    public function components(): HasMany
    {
        return $this->hasMany(CompositeItemComponent::class, 'composite_item_id')->orderBy('sort_order');
    }

    /** Composite items that use this item as a component. */
    public function usedInComposites(): HasMany
    {
        return $this->hasMany(CompositeItemComponent::class, 'component_item_id');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class, 'auditable_id')
            ->where('auditable_type', $this->getTable())
            ->latest('created_at');
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeSearch($query, ?string $term)
    {
        if (!$term) return $query;
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('sku', 'like', "%{$term}%");
        });
    }

    public function scopeOfType($query, ?string $type)
    {
        return $type ? $query->where('item_type', $type) : $query;
    }

    public function scopeComposite($query)
    {
        return $query->where('is_composite', true);
    }
}
