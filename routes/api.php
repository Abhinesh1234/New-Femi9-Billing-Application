<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompositeItemController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\SeriesController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\GstRateController;
use App\Http\Controllers\Api\HsnCodeController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\PriceListController;
use App\Http\Controllers\Api\SettingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ── Auth (public) ─────────────────────────────────────────────────────────────
Route::prefix('auth')->middleware('throttle:10,1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// ── Auth (protected) ──────────────────────────────────────────────────────────
Route::prefix('auth')->middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout',          [AuthController::class, 'logout']);
    Route::get('/me',               [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
});

// ── All routes below require a valid Sanctum token ────────────────────────────
Route::middleware(['auth:sanctum'])->group(function () {

    // ── Settings ──────────────────────────────────────────────────────────────
    Route::prefix('settings')->group(function () {
        Route::get('/{module}', [SettingController::class, 'show']);
        Route::put('/{module}', [SettingController::class, 'update']);
    });

    // ── Items ─────────────────────────────────────────────────────────────────
    Route::prefix('items')->middleware('throttle:60,1')->group(function () {
        Route::get('/',                          [ItemController::class, 'index']);
        Route::post('/',                         [ItemController::class, 'store'])->middleware('throttle:30,1');
        Route::post('/upload-image',             [ItemController::class, 'uploadImage'])->middleware('throttle:30,1');
        Route::post('/upload-attachment',        [ItemController::class, 'uploadAttachment'])->middleware('throttle:30,1');
        Route::get('/auto-generate-preview',     [ItemController::class, 'autoGeneratePreview']);
        Route::get('/{item}',                    [ItemController::class, 'show']);
        Route::put('/{item}',              [ItemController::class, 'update'])->middleware('throttle:30,1');
        Route::delete('/{item}',           [ItemController::class, 'destroy']);
        Route::post('/{item}/restore',     [ItemController::class, 'restore']);
    });

    // ── Composite Items ───────────────────────────────────────────────────────
    Route::prefix('composite-items')->middleware('throttle:60,1')->group(function () {
        Route::get('/',                          [CompositeItemController::class, 'index']);
        Route::post('/',                         [CompositeItemController::class, 'store'])->middleware('throttle:30,1');
        Route::post('/upload-image',             [CompositeItemController::class, 'uploadImage'])->middleware('throttle:30,1');
        Route::get('/{compositeItem}',           [CompositeItemController::class, 'show']);
        Route::put('/{compositeItem}',           [CompositeItemController::class, 'update'])->middleware('throttle:30,1');
        Route::delete('/{compositeItem}',        [CompositeItemController::class, 'destroy']);
        Route::post('/{compositeItem}/restore',  [CompositeItemController::class, 'restore']);
    });

    // ── Brands ────────────────────────────────────────────────────────────────
    Route::prefix('brands')->middleware('throttle:60,1')->group(function () {
        Route::get('/',                   [BrandController::class, 'index']);
        Route::post('/',                  [BrandController::class, 'store'])->middleware('throttle:30,1');
        Route::put('/{brand}',            [BrandController::class, 'update'])->middleware('throttle:30,1');
        Route::delete('/{brand}',         [BrandController::class, 'destroy'])->middleware('throttle:30,1');
        Route::post('/{brand}/restore',   [BrandController::class, 'restore'])->middleware('throttle:30,1');
    });

    // ── Categories ────────────────────────────────────────────────────────────
    Route::prefix('categories')->middleware('throttle:60,1')->group(function () {
        Route::get('/',                     [CategoryController::class, 'index']);
        Route::post('/',                    [CategoryController::class, 'store'])->middleware('throttle:30,1');
        Route::put('/{category}',           [CategoryController::class, 'update'])->middleware('throttle:30,1');
        Route::delete('/{category}',        [CategoryController::class, 'destroy'])->middleware('throttle:30,1');
        Route::post('/{category}/restore',  [CategoryController::class, 'restore'])->middleware('throttle:30,1');
    });

    // ── HSN Codes ─────────────────────────────────────────────────────────────
    Route::prefix('hsn-codes')->middleware('throttle:60,1')->group(function () {
        Route::get('/',                   [HsnCodeController::class, 'index']);
        Route::post('/',                  [HsnCodeController::class, 'store'])->middleware('throttle:30,1');
        Route::put('/{hsnCode}',          [HsnCodeController::class, 'update'])->middleware('throttle:30,1');
        Route::delete('/{hsnCode}',       [HsnCodeController::class, 'destroy'])->middleware('throttle:30,1');
        Route::post('/{hsnCode}/restore', [HsnCodeController::class, 'restore'])->middleware('throttle:30,1');
    });

    // ── GST Rates ─────────────────────────────────────────────────────────────
    Route::prefix('gst-rates')->middleware('throttle:60,1')->group(function () {
        Route::get('/',                   [GstRateController::class, 'index']);
        Route::post('/',                  [GstRateController::class, 'store'])->middleware('throttle:30,1');
        Route::put('/{gstRate}',          [GstRateController::class, 'update'])->middleware('throttle:30,1');
        Route::delete('/{gstRate}',       [GstRateController::class, 'destroy'])->middleware('throttle:30,1');
        Route::post('/{gstRate}/restore', [GstRateController::class, 'restore'])->middleware('throttle:30,1');
    });

    // ── Accounts ──────────────────────────────────────────────────────────────
    Route::prefix('accounts')->middleware('throttle:60,1')->group(function () {
        Route::get('/',                    [AccountController::class, 'index']);
        Route::post('/',                   [AccountController::class, 'store'])->middleware('throttle:30,1');
        Route::put('/{account}',           [AccountController::class, 'update'])->middleware('throttle:30,1');
        Route::delete('/{account}',        [AccountController::class, 'destroy'])->middleware('throttle:30,1');
        Route::post('/{account}/restore',  [AccountController::class, 'restore'])->middleware('throttle:30,1');
    });

    // ── Locations ─────────────────────────────────────────────────────────────
    Route::prefix('locations')->middleware('throttle:60,1')->group(function () {
        Route::get('/',              [LocationController::class, 'index']);
        Route::post('/',             [LocationController::class, 'store'])->middleware('throttle:30,1');
        Route::post('/upload-logo',  [LocationController::class, 'uploadLogo'])->middleware('throttle:30,1');
        Route::get('/{id}',          [LocationController::class, 'show']);
        Route::put('/{id}',          [LocationController::class, 'update'])->middleware('throttle:30,1');
        Route::delete('/{id}',       [LocationController::class, 'destroy']);
        Route::post('/{id}/restore', [LocationController::class, 'restore']);

        // Set primary location
        Route::post('/{id}/set-primary', [LocationController::class, 'setPrimary'])->middleware('throttle:30,1');

        // Access users (JSON column patch)
        Route::put('/{id}/access', [LocationController::class, 'updateAccess'])->middleware('throttle:30,1');

    });

    // ── Price Lists ───────────────────────────────────────────────────────────
    Route::prefix('price-lists')->middleware('throttle:60,1')->group(function () {
        Route::get('/',         [PriceListController::class, 'index']);
        Route::post('/',        [PriceListController::class, 'store'])->middleware('throttle:30,1');
        Route::get('/{id}',     [PriceListController::class, 'show']);
        Route::put('/{id}',     [PriceListController::class, 'update'])->middleware('throttle:30,1');
        Route::delete('/{id}',  [PriceListController::class, 'destroy']);
    });

    // ── Transaction Series ────────────────────────────────────────────────────
    Route::prefix('series')->middleware('throttle:60,1')->group(function () {
        Route::get('/',         [SeriesController::class, 'index']);
        Route::post('/',        [SeriesController::class, 'store'])->middleware('throttle:30,1');
        Route::get('/{id}',             [SeriesController::class, 'show']);
        Route::put('/{id}',             [SeriesController::class, 'update'])->middleware('throttle:30,1');
        Route::patch('/{id}/locations', [SeriesController::class, 'assignLocations'])->middleware('throttle:30,1');
        Route::delete('/{id}',          [SeriesController::class, 'destroy']);
    });

    // ── Audit logs ────────────────────────────────────────────────────────────
    Route::prefix('audit-logs')->middleware('throttle:60,1')->group(function () {
        Route::get('/',             [AuditLogController::class, 'index']);
        Route::get('/{type}/{id}',  [AuditLogController::class, 'forRecord']);
    });

    // ── Custom fields ─────────────────────────────────────────────────────────
    Route::prefix('custom-fields')->middleware('throttle:60,1')->group(function () {
        Route::get('/show/{id}', [SettingController::class, 'showCustomField']);
        Route::get('/{module}',  [SettingController::class, 'indexCustomFields']);
        Route::post('/',         [SettingController::class, 'storeCustomField'])->middleware('throttle:30,1');
        Route::put('/{id}',      [SettingController::class, 'updateCustomField'])->middleware('throttle:30,1');
        Route::delete('/{id}',   [SettingController::class, 'destroyCustomField'])->middleware('throttle:20,1');
    });

}); // end auth:sanctum
