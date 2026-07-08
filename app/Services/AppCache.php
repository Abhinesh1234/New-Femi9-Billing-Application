<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Centralised cache layer for slow-changing, frequently-read reference data.
 *
 * Every method uses Cache::remember() so the first call warms Redis and
 * subsequent calls never touch MySQL. Call the matching flush*() method
 * whenever the underlying data changes (on create/update/delete).
 */
class AppCache
{
    private const TTL_LONG  = 3600;  // 1 hour — settings, rates, series
    private const TTL_SHORT = 600;   // 10 min — items, price lists

    // ─── GST Rates ────────────────────────────────────────────────────────────

    public static function gstRates(): array
    {
        return Cache::remember('ref:gst_rates', self::TTL_LONG, function () {
            return DB::table('gst_rates')
                ->whereNull('deleted_at')
                ->orderBy('rate')
                ->get(['id', 'label', 'rate'])
                ->toArray();
        });
    }

    public static function flushGstRates(): void
    {
        Cache::forget('ref:gst_rates');
    }

    // ─── Transaction Series ───────────────────────────────────────────────────

    public static function transactionSeries(): array
    {
        return Cache::remember('ref:transaction_series', self::TTL_LONG, function () {
            return DB::table('transaction_series')
                ->whereNull('deleted_at')
                ->get(['id', 'name', 'is_system_default'])
                ->toArray();
        });
    }

    public static function flushTransactionSeries(): void
    {
        Cache::forget('ref:transaction_series');
    }

    // ─── Brands ───────────────────────────────────────────────────────────────

    public static function brands(): array
    {
        return Cache::remember('ref:brands', self::TTL_LONG, function () {
            return DB::table('brands')
                ->whereNull('deleted_at')
                ->orderBy('name')
                ->get(['id', 'name'])
                ->toArray();
        });
    }

    public static function flushBrands(): void
    {
        Cache::forget('ref:brands');
    }

    // ─── Categories ───────────────────────────────────────────────────────────

    public static function categories(): array
    {
        return Cache::remember('ref:categories', self::TTL_LONG, function () {
            return DB::table('categories')
                ->whereNull('deleted_at')
                ->orderBy('name')
                ->get(['id', 'name'])
                ->toArray();
        });
    }

    public static function flushCategories(): void
    {
        Cache::forget('ref:categories');
    }

    // ─── HSN Codes ────────────────────────────────────────────────────────────

    public static function hsnCodes(): array
    {
        return Cache::remember('ref:hsn_codes', self::TTL_LONG, function () {
            return DB::table('hsn_codes')
                ->whereNull('deleted_at')
                ->orderBy('code')
                ->get(['id', 'code', 'description'])
                ->toArray();
        });
    }

    public static function flushHsnCodes(): void
    {
        Cache::forget('ref:hsn_codes');
    }

    // ─── Items (per search term, short TTL) ───────────────────────────────────

    public static function itemsAll(): array
    {
        return Cache::remember('ref:items_all', self::TTL_SHORT, function () {
            return DB::table('items')
                ->whereNull('deleted_at')
                ->orderBy('name')
                ->get(['id', 'name', 'sku', 'selling_price', 'unit'])
                ->toArray();
        });
    }

    public static function flushItems(): void
    {
        Cache::forget('ref:items_all');
    }

    // ─── Price Lists ──────────────────────────────────────────────────────────

    public static function priceLists(): array
    {
        return Cache::remember('ref:price_lists', self::TTL_SHORT, function () {
            return DB::table('price_lists')
                ->whereNull('deleted_at')
                ->orderBy('name')
                ->get(['id', 'name'])
                ->toArray();
        });
    }

    public static function flushPriceLists(): void
    {
        Cache::forget('ref:price_lists');
    }

    // ─── Locations ────────────────────────────────────────────────────────────

    public static function locations(): array
    {
        return Cache::remember('ref:locations', self::TTL_LONG, function () {
            return DB::table('locations')
                ->whereNull('deleted_at')
                ->orderBy('name')
                ->get(['id', 'name'])
                ->toArray();
        });
    }

    public static function flushLocations(): void
    {
        Cache::forget('ref:locations');
    }

    // ─── Flush all reference data ─────────────────────────────────────────────

    public static function flushAll(): void
    {
        foreach ([
            'ref:gst_rates', 'ref:transaction_series', 'ref:brands',
            'ref:categories', 'ref:hsn_codes', 'ref:items_all',
            'ref:price_lists', 'ref:locations',
        ] as $key) {
            Cache::forget($key);
        }
    }
}
