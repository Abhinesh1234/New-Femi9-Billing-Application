<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PartyAuthController;
use App\Http\Controllers\Api\AssemblyController;
use App\Http\Controllers\Api\CompositeItemController;
use App\Http\Controllers\Api\CountryController;
use App\Http\Controllers\Api\DistributionLocationNodeController;
use App\Http\Controllers\Api\CustomerActivityLogController;
use App\Http\Controllers\Api\CreditNoteController;
use App\Http\Controllers\Api\CustomerCreditController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\InvoiceReferenceController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\LocationLayerSchemaController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\TaxController;
use App\Http\Controllers\Api\SeriesController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DistributionCategoryController;
use App\Http\Controllers\Api\DistributionSubCategoryController;
use App\Http\Controllers\Api\GstRateController;
use App\Http\Controllers\Api\HsnCodeController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\OpeningStockController;
use App\Http\Controllers\Api\PriceListController;
use App\Http\Controllers\Api\CustomerApprovalController;
use App\Http\Controllers\Api\InvoiceApprovalController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\PartyController;
use App\Http\Controllers\Api\PartyCommentController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\InventoryAdjustmentController;
use App\Http\Controllers\Api\InventoryAdjustmentReasonController;
use App\Http\Controllers\Api\TransferOrderController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PartyReorderPointController;
use App\Http\Controllers\Api\PartyNotificationController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ItemSalesChartController;
use App\Http\Controllers\Api\ItemTransactionsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ── Company auth (public) ─────────────────────────────────────────────────────
Route::prefix('auth')->middleware('throttle:10,1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// ── Company auth (protected) ──────────────────────────────────────────────────
Route::prefix('auth')->middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout',          [AuthController::class, 'logout']);
    Route::get('/me',               [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
});

// ── Party portal auth (public) ────────────────────────────────────────────────
Route::prefix('party/auth')->middleware('throttle:10,1')->group(function () {
    Route::post('/login',  [PartyAuthController::class, 'login']);
    Route::post('/select', [PartyAuthController::class, 'select']); // confirm category after party_pending
});

// ── Party portal auth (protected) ─────────────────────────────────────────────
Route::prefix('party/auth')->middleware(['auth:sanctum', 'scope.party'])->group(function () {
    Route::post('/logout',          [PartyAuthController::class, 'logout']);
    Route::get('/me',               [PartyAuthController::class, 'me']);
    Route::post('/change-password', [PartyAuthController::class, 'changePassword']);
    Route::post('/avatar',          [PartyAuthController::class, 'updateAvatar']);
    Route::delete('/avatar',        [PartyAuthController::class, 'removeAvatar']);
    Route::put('/banking',          [PartyAuthController::class, 'updateBanking']);
    Route::put('/organisation',                      [PartyAuthController::class, 'updateOrganisation']);
    Route::post('/location/{id}/logo',               [PartyAuthController::class, 'updateLocationLogo']);
    Route::delete('/location/{id}/logo',             [PartyAuthController::class, 'removeLocationLogo']);
    Route::put('/location/{id}/address',             [PartyAuthController::class, 'updateLocationAddress']);
    Route::put('/location/{id}/org-name',            [PartyAuthController::class, 'updateLocationOrgName']);
    Route::post('/switch',          [PartyAuthController::class, 'switchCategory']); // switch distribution category
});

// ── Party-only routes (party portal) ─────────────────────────────────────────
Route::middleware(['auth:sanctum', 'scope.party'])->prefix('party')->group(function () {
    // Reorder points — party sets their own per-item threshold
    Route::get('/items/{item}/reorder-point',  [PartyReorderPointController::class, 'show']);
    Route::post('/items/{item}/reorder-point', [PartyReorderPointController::class, 'upsert']);

    // In-app notifications
    Route::get('/notifications',              [PartyNotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [PartyNotificationController::class, 'unreadCount']);
    Route::post('/notifications/read-all',    [PartyNotificationController::class, 'markAllRead']);
    Route::post('/notifications/{id}/read',   [PartyNotificationController::class, 'markRead']);
});

// ── All routes below require a valid Sanctum token ────────────────────────────
// scope.party middleware runs after auth:sanctum; it sets party_scope_id on the
// request when the token belongs to a PartyUser — controllers use this to scope data.
Route::middleware(['auth:sanctum', 'scope.party'])->group(function () {

    // ── Reorder notification flag (no perm check — readable by all users) ──────
    Route::get('/settings/reorder-notification-enabled', [SettingController::class, 'reorderNotificationEnabled'])
        ->middleware('throttle:60,1');

    // ── Notifications (unified — works for admin users and party portal users) ──
    Route::prefix('notifications')->middleware('throttle:60,1')->group(function () {
        Route::get('/',              [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('/read-all',    [NotificationController::class, 'markAllRead']);
        Route::post('/{id}/read',   [NotificationController::class, 'markRead']);
        Route::delete('/all',       [NotificationController::class, 'destroyAll']);
        Route::delete('/{id}',      [NotificationController::class, 'destroy']);
    });

    // ── Settings ──────────────────────────────────────────────────────────────
    Route::prefix('settings')->middleware('throttle:60,1')->group(function () {
        Route::get('/{module}', [SettingController::class, 'show'])->middleware('perm:items|composite_items,view,allow_party');
        Route::put('/{module}', [SettingController::class, 'update'])->middleware(['throttle:60,1', 'perm:settings,edit']);
    });

    // ── Items ─────────────────────────────────────────────────────────────────
    Route::prefix('items')->middleware('throttle:60,1')->group(function () {
        Route::get('/',                          [ItemController::class, 'index'])->middleware('perm:items,view');
        Route::get('/auto-generate-preview',     [ItemController::class, 'autoGeneratePreview'])->middleware('perm:items,view');
        Route::get('/{item}',                    [ItemController::class, 'show'])->middleware('perm:items,view');
        Route::get('/{item}/opening-stock',      [OpeningStockController::class, 'show'])->middleware('perm:items|composite_items,view,allow_party');
        Route::get('/{item}/stock',              [OpeningStockController::class, 'stock'])->middleware('perm:items|composite_items,view,allow_party');
        Route::get('/{item}/sales-chart',        [ItemSalesChartController::class, '__invoke'])->middleware('perm:items|composite_items,view,allow_party');
        Route::get('/{item}/transactions',       [ItemTransactionsController::class, '__invoke'])->middleware('perm:items|composite_items,view,allow_party');
        Route::post('/stock-batch',              [OpeningStockController::class, 'stockBatch'])->middleware(['throttle:60,1', 'perm:items,view']);
        Route::post('/stock-totals',             [OpeningStockController::class, 'stockTotals'])->middleware(['throttle:60,1', 'perm:items,view']);
        Route::post('/',                         [ItemController::class, 'store'])->middleware(['throttle:60,1', 'perm:items,create']);
        Route::post('/upload-image',             [ItemController::class, 'uploadImage'])->middleware(['throttle:60,1', 'perm:items,create']);
        Route::post('/upload-attachment',        [ItemController::class, 'uploadAttachment'])->middleware(['throttle:60,1', 'perm:items,create']);
        Route::put('/{item}',                    [ItemController::class, 'update'])->middleware(['throttle:60,1', 'perm:items,edit']);
        Route::post('/{item}/restore',           [ItemController::class, 'restore'])->middleware(['throttle:60,1', 'perm:items,edit']);
        Route::post('/{item}/opening-stock',     [OpeningStockController::class, 'save'])->middleware(['throttle:60,1', 'perm:items,edit,allow_party']);
        Route::delete('/{item}',                 [ItemController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:items,delete']);
    });

    // ── Inventory ─────────────────────────────────────────────────────────────
    Route::prefix('inventory')->middleware('throttle:60,1')->group(function () {
        Route::get('/summary', [InventoryController::class, 'summary'])->middleware('perm:inventory,view');

        // ── Adjustment Reasons ────────────────────────────────────────────────
        Route::prefix('adjustment-reasons')->group(function () {
            Route::get('/',        [InventoryAdjustmentReasonController::class, 'index'])->middleware('perm:inventory_adjustments,view');
            Route::post('/',       [InventoryAdjustmentReasonController::class, 'store'])->middleware(['throttle:60,1', 'perm:inventory_adjustments,create']);
            Route::put('/{id}',    [InventoryAdjustmentReasonController::class, 'update'])->middleware(['throttle:60,1', 'perm:inventory_adjustments,edit']);
            Route::delete('/{id}', [InventoryAdjustmentReasonController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:inventory_adjustments,delete']);
        });

        // ── Adjustments ───────────────────────────────────────────────────────
        Route::prefix('adjustments')->group(function () {
            Route::get('/',                                              [InventoryAdjustmentController::class, 'index'])->middleware('perm:inventory_adjustments,view');
            Route::post('/',                                             [InventoryAdjustmentController::class, 'store'])->middleware(['throttle:60,1', 'perm:inventory_adjustments,create']);
            Route::get('/{adjustment}',                                  [InventoryAdjustmentController::class, 'show'])->middleware('perm:inventory_adjustments,view');
            Route::delete('/{adjustment}',                               [InventoryAdjustmentController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:inventory_adjustments,delete']);
            Route::post('/{adjustment}/attachments',                     [InventoryAdjustmentController::class, 'uploadAttachment'])->middleware(['throttle:60,1', 'perm:inventory_adjustments,edit']);
            Route::delete('/{adjustment}/attachments/{attachment}',      [InventoryAdjustmentController::class, 'deleteAttachment'])->middleware(['throttle:60,1', 'perm:inventory_adjustments,edit']);
        });
    });

    // ── Transfer Orders ───────────────────────────────────────────────────────
    Route::prefix('transfer-orders')->middleware('throttle:60,1')->group(function () {
        Route::get('/next-number',    [TransferOrderController::class, 'nextNumber'])->middleware('perm:transfer_orders,view');
        Route::get('/',               [TransferOrderController::class, 'index'])->middleware('perm:transfer_orders,view');
        Route::get('/{id}',           [TransferOrderController::class, 'show'])->middleware('perm:transfer_orders,view');
        Route::post('/',              [TransferOrderController::class, 'store'])->middleware('perm:transfer_orders,create');
        Route::put('/{id}',           [TransferOrderController::class, 'update'])->middleware('perm:transfer_orders,edit');
        Route::post('/{id}/initiate', [TransferOrderController::class, 'initiate'])->middleware('perm:transfer_orders,edit');
        Route::post('/{id}/transfer', [TransferOrderController::class, 'transfer'])->middleware('perm:transfer_orders,edit');
        Route::post('/{id}/cancel',   [TransferOrderController::class, 'cancel'])->middleware('perm:transfer_orders,edit');
        Route::delete('/{id}',        [TransferOrderController::class, 'destroy'])->middleware('perm:transfer_orders,delete');
    });

    // ── Assemblies ────────────────────────────────────────────────────────────
    Route::prefix('assemblies')->middleware('throttle:60,1')->group(function () {
        Route::get('/next-number',           [AssemblyController::class, 'nextNumber'])->middleware('perm:assemblies,view');
        Route::get('/',                      [AssemblyController::class, 'index'])->middleware('perm:assemblies,view');
        Route::get('/{assembly}',            [AssemblyController::class, 'show'])->middleware('perm:assemblies,view');
        Route::post('/',                     [AssemblyController::class, 'store'])->middleware(['throttle:60,1', 'perm:assemblies,create']);
        Route::post('/{assembly}/cancel',    [AssemblyController::class, 'cancel'])->middleware(['throttle:60,1', 'perm:assemblies,edit']);
        Route::delete('/{assembly}',         [AssemblyController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:assemblies,delete']);
    });

    // ── Composite Items ───────────────────────────────────────────────────────
    Route::prefix('composite-items')->middleware('throttle:60,1')->group(function () {
        Route::get('/',                          [CompositeItemController::class, 'index'])->middleware('perm:composite_items,view');
        Route::get('/{compositeItem}',           [CompositeItemController::class, 'show'])->middleware('perm:composite_items,view');
        Route::post('/',                         [CompositeItemController::class, 'store'])->middleware(['throttle:60,1', 'perm:composite_items,create']);
        Route::post('/upload-image',             [CompositeItemController::class, 'uploadImage'])->middleware(['throttle:60,1', 'perm:composite_items,create']);
        Route::put('/{compositeItem}',           [CompositeItemController::class, 'update'])->middleware(['throttle:60,1', 'perm:composite_items,edit']);
        Route::post('/{compositeItem}/restore',  [CompositeItemController::class, 'restore'])->middleware(['throttle:60,1', 'perm:composite_items,edit']);
        Route::delete('/{compositeItem}',        [CompositeItemController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:composite_items,delete']);
    });

    // ── Brands (item reference data) ─────────────────────────────────────────
    Route::prefix('brands')->middleware('throttle:60,1')->group(function () {
        Route::get('/',                   [BrandController::class, 'index'])->middleware('perm:items,view');
        Route::post('/',                  [BrandController::class, 'store'])->middleware(['throttle:60,1', 'perm:items,create']);
        Route::put('/{brand}',            [BrandController::class, 'update'])->middleware(['throttle:60,1', 'perm:items,edit']);
        Route::delete('/{brand}',         [BrandController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:items,delete']);
        Route::post('/{brand}/restore',   [BrandController::class, 'restore'])->middleware(['throttle:60,1', 'perm:items,edit']);
    });

    // ── Categories (item reference data) ─────────────────────────────────────
    Route::prefix('categories')->middleware('throttle:60,1')->group(function () {
        Route::get('/',                     [CategoryController::class, 'index'])->middleware('perm:items,view');
        Route::post('/',                    [CategoryController::class, 'store'])->middleware(['throttle:60,1', 'perm:items,create']);
        Route::put('/{category}',           [CategoryController::class, 'update'])->middleware(['throttle:60,1', 'perm:items,edit']);
        Route::delete('/{category}',        [CategoryController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:items,delete']);
        Route::post('/{category}/restore',  [CategoryController::class, 'restore'])->middleware(['throttle:60,1', 'perm:items,edit']);
    });

    // ── Distribution Categories ───────────────────────────────────────────────
    Route::prefix('distribution-categories')->middleware('throttle:60,1')->group(function () {
        Route::get('/',                                [DistributionCategoryController::class, 'index'])->middleware('perm:parties,view,allow_party');
        Route::get('/{distribution_category}',         [DistributionCategoryController::class, 'show'])->middleware('perm:parties,view,allow_party');
        Route::post('/',                               [DistributionCategoryController::class, 'store'])->middleware(['throttle:60,1', 'perm:parties,create']);
        Route::put('/{distribution_category}',         [DistributionCategoryController::class, 'update'])->middleware(['throttle:60,1', 'perm:parties,edit']);
        Route::delete('/{distribution_category}',      [DistributionCategoryController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:parties,delete']);
        Route::post('/{distribution_category}/restore',[DistributionCategoryController::class, 'restore'])->middleware(['throttle:60,1', 'perm:parties,edit']);
    });

    // ── Distribution Sub Categories ───────────────────────────────────────────
    Route::prefix('distribution-sub-categories')->middleware('throttle:60,1')->group(function () {
        Route::get('/',                                    [DistributionSubCategoryController::class, 'index'])->middleware('perm:parties,view');
        Route::get('/{distribution_sub_category}',         [DistributionSubCategoryController::class, 'show'])->middleware('perm:parties,view');
        Route::post('/',                                   [DistributionSubCategoryController::class, 'store'])->middleware(['throttle:60,1', 'perm:parties,create']);
        Route::put('/{distribution_sub_category}',         [DistributionSubCategoryController::class, 'update'])->middleware(['throttle:60,1', 'perm:parties,edit']);
        Route::delete('/{distribution_sub_category}',      [DistributionSubCategoryController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:parties,delete']);
        Route::post('/{distribution_sub_category}/restore',[DistributionSubCategoryController::class, 'restore'])->middleware(['throttle:60,1', 'perm:parties,edit']);
    });

    // ── HSN Codes (item reference data) ──────────────────────────────────────
    Route::prefix('hsn-codes')->middleware('throttle:60,1')->group(function () {
        Route::get('/',                   [HsnCodeController::class, 'index'])->middleware('perm:items,view');
        Route::post('/',                  [HsnCodeController::class, 'store'])->middleware(['throttle:60,1', 'perm:items,create']);
        Route::put('/{hsnCode}',          [HsnCodeController::class, 'update'])->middleware(['throttle:60,1', 'perm:items,edit']);
        Route::delete('/{hsnCode}',       [HsnCodeController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:items,delete']);
        Route::post('/{hsnCode}/restore', [HsnCodeController::class, 'restore'])->middleware(['throttle:60,1', 'perm:items,edit']);
    });

    // ── GST Rates ─────────────────────────────────────────────────────────────
    // Read is gated by items,view (needed for item add/edit form dropdowns).
    // Write operations still require settings permission.
    Route::prefix('gst-rates')->middleware('throttle:60,1')->group(function () {
        Route::get('/',                   [GstRateController::class, 'index'])->middleware('perm:items|composite_items,view,allow_party');
        Route::post('/',                  [GstRateController::class, 'store'])->middleware(['throttle:60,1', 'perm:settings,create']);
        Route::put('/{gstRate}',          [GstRateController::class, 'update'])->middleware(['throttle:60,1', 'perm:settings,edit']);
        Route::delete('/{gstRate}',       [GstRateController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:settings,delete']);
        Route::post('/{gstRate}/restore', [GstRateController::class, 'restore'])->middleware(['throttle:60,1', 'perm:settings,edit']);
    });

    // ── Accounts ──────────────────────────────────────────────────────────────
    // Read is gated by items,view (needed for item add/edit form dropdowns).
    // Write operations still require settings permission.
    Route::prefix('accounts')->middleware('throttle:60,1')->group(function () {
        Route::get('/',                    [AccountController::class, 'index'])->middleware('perm:items|composite_items,view,allow_party');
        Route::post('/',                   [AccountController::class, 'store'])->middleware(['throttle:60,1', 'perm:settings,create']);
        Route::put('/{account}',           [AccountController::class, 'update'])->middleware(['throttle:60,1', 'perm:settings,edit']);
        Route::delete('/{account}',        [AccountController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:settings,delete']);
        Route::post('/{account}/restore',  [AccountController::class, 'restore'])->middleware(['throttle:60,1', 'perm:settings,edit']);
    });

    // ── Locations ─────────────────────────────────────────────────────────────
    Route::prefix('locations')->middleware('throttle:60,1')->group(function () {
        Route::get('/',              [LocationController::class, 'index'])->middleware('perm:locations,view');
        Route::get('/{id}',          [LocationController::class, 'show'])->middleware('perm:locations,view');
        Route::post('/',             [LocationController::class, 'store'])->middleware(['throttle:60,1', 'perm:locations,create']);
        Route::post('/upload-logo',  [LocationController::class, 'uploadLogo'])->middleware(['throttle:60,1', 'perm:locations,create']);
        Route::put('/{id}',          [LocationController::class, 'update'])->middleware(['throttle:60,1', 'perm:locations,edit']);
        Route::put('/{id}/access',   [LocationController::class, 'updateAccess'])->middleware(['throttle:60,1', 'perm:locations,edit']);
        Route::post('/{id}/set-primary', [LocationController::class, 'setPrimary'])->middleware(['throttle:60,1', 'perm:locations,edit']);
        Route::post('/{id}/restore', [LocationController::class, 'restore'])->middleware(['throttle:60,1', 'perm:locations,edit']);
        Route::delete('/{id}',       [LocationController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:locations,delete']);
    });

    // ── Price Lists ───────────────────────────────────────────────────────────
    Route::prefix('price-lists')->middleware('throttle:60,1')->group(function () {
        Route::get('/',              [PriceListController::class, 'index'])->middleware('perm:price_list,view,allow_party');
        Route::get('/{id}',          [PriceListController::class, 'show'])->middleware('perm:price_list,view,allow_party');
        Route::post('/',             [PriceListController::class, 'store'])->middleware(['throttle:60,1', 'perm:price_list,create']);
        Route::put('/{id}',          [PriceListController::class, 'update'])->middleware(['throttle:60,1', 'perm:price_list,edit']);
        Route::post('/{id}/restore', [PriceListController::class, 'restore'])->middleware(['throttle:60,1', 'perm:price_list,edit']);
        Route::delete('/{id}',       [PriceListController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:price_list,delete']);
    });

    // ── Transaction Series ────────────────────────────────────────────────────
    Route::prefix('series')->middleware('throttle:60,1')->group(function () {
        Route::get('/',                          [SeriesController::class, 'index'])->middleware('perm:locations,view');
        Route::get('/for-location/{locationId}', [SeriesController::class, 'forLocation'])->middleware('perm:locations,view');
        Route::get('/{id}/next-number',          [SeriesController::class, 'nextNumber'])->middleware('perm:locations,view');
        Route::get('/{id}',                      [SeriesController::class, 'show'])->middleware('perm:locations,view');
        Route::post('/',                         [SeriesController::class, 'store'])->middleware(['throttle:60,1', 'perm:locations,create']);
        Route::put('/{id}',                      [SeriesController::class, 'update'])->middleware(['throttle:60,1', 'perm:locations,edit']);
        Route::patch('/{id}/locations',          [SeriesController::class, 'assignLocations'])->middleware(['throttle:60,1', 'perm:locations,edit']);
        Route::patch('/{id}/restore',            [SeriesController::class, 'restore'])->middleware(['throttle:60,1', 'perm:locations,edit']);
        Route::delete('/{id}',                   [SeriesController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:locations,delete']);
    });

    // ── Parties ───────────────────────────────────────────────────────────────
    Route::prefix('parties')->middleware('throttle:60,1')->group(function () {
        Route::get('/',                        [PartyController::class, 'index'])->middleware('perm:parties,view,allow_party');
        Route::get('/search',                  [PartyController::class, 'search'])->middleware('perm:parties,view,allow_party');
        Route::get('/preview-id',              [PartyController::class, 'previewId'])->middleware('perm:parties,view');
        Route::get('/taken-locations',         [PartyController::class, 'takenLocations'])->middleware('perm:parties,view');
        Route::get('/check-display-name',      [PartyController::class, 'checkDisplayName'])->middleware('perm:parties,view,allow_party');
        Route::get('/{id}',                    [PartyController::class, 'show'])->middleware('perm:parties,view,allow_party');
        Route::get('/{id}/receivables',        [PartyController::class, 'receivables'])->middleware('perm:parties,view,allow_party');
        Route::get('/{id}/children',           [PartyController::class, 'children'])->middleware('perm:parties,view,allow_party');
        Route::get('/{partyId}/comments',      [PartyCommentController::class, 'index'])->middleware('perm:parties,view,allow_party');
        Route::get('/{customerId}/activity',   [CustomerActivityLogController::class, 'index'])->middleware('perm:parties,view,allow_party');
        Route::post('/',                       [PartyController::class, 'store'])->middleware(['throttle:60,1', 'perm:parties,create,allow_party']);
        Route::post('/upload-image',           [PartyController::class, 'uploadImage'])->middleware(['throttle:60,1', 'perm:parties,create,allow_party']);
        Route::post('/upload-document',        [PartyController::class, 'uploadDocument'])->middleware(['throttle:60,1', 'perm:parties,create,allow_party']);
        Route::post('/{partyId}/comments',     [PartyCommentController::class, 'store'])->middleware(['throttle:60,1', 'perm:parties,create']);
        Route::put('/{id}',                    [PartyController::class, 'update'])->middleware(['throttle:60,1', 'perm:parties,edit']);
        Route::post('/{id}/restore',           [PartyController::class, 'restore'])->middleware(['throttle:60,1', 'perm:parties,edit']);
        Route::post('/{id}/toggle-status',     [PartyController::class, 'toggleStatus'])->middleware(['throttle:60,1', 'perm:parties,edit,allow_party']);
        Route::post('/{id}/approve',           [PartyController::class, 'approve'])->middleware(['throttle:60,1', 'perm:parties,edit']);
        Route::post('/{id}/reject',            [PartyController::class, 'reject'])->middleware(['throttle:60,1', 'perm:parties,edit']);
        Route::delete('/{id}',                 [PartyController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:parties,delete,allow_party']);
        Route::delete('/{partyId}/comments/{commentId}', [PartyCommentController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:parties,delete']);
    });

    // ── Users ─────────────────────────────────────────────────────────────────
    Route::get('users',          [UserController::class, 'index'])->middleware(['throttle:60,1', 'perm:users,view']);
    Route::get('users/{id}',     [UserController::class, 'show'])->middleware(['throttle:60,1', 'perm:users,view']);
    Route::post('users',         [UserController::class, 'store'])->middleware(['throttle:60,1', 'perm:users,create']);
    Route::put('users/{id}',     [UserController::class, 'update'])->middleware(['throttle:60,1', 'perm:users,edit']);

    // ── Approvals ─────────────────────────────────────────────────────────────
    Route::prefix('approvals')->middleware(['throttle:60,1', 'perm:settings,view'])->group(function () {
        Route::get('invoices',   [InvoiceApprovalController::class,  'show']);
        Route::put('invoices',   [InvoiceApprovalController::class,  'update'])->middleware(['throttle:60,1', 'perm:settings,edit']);
        Route::get('customers',  [CustomerApprovalController::class, 'show']);
        Route::put('customers',  [CustomerApprovalController::class, 'update'])->middleware(['throttle:60,1', 'perm:settings,edit']);
    });

    // ── Audit logs ────────────────────────────────────────────────────────────
    // Global feed requires settings access; per-record history only requires items access
    // (called from item/composite-item overview pages by users who may lack settings permission).
    Route::prefix('audit-logs')->group(function () {
        Route::get('/',             [AuditLogController::class, 'index'])     ->middleware(['throttle:60,1', 'perm:settings,view']);
        Route::get('/party/{id}',   [AuditLogController::class, 'forParty']) ->middleware(['throttle:60,1', 'perm:parties,view,allow_party']);
        Route::get('/{type}/{id}',  [AuditLogController::class, 'forRecord'])->middleware(['throttle:60,1', 'perm:items,view']);
    });

    // ── Custom fields ─────────────────────────────────────────────────────────
    // Read is gated by items,view (needed for item add/edit forms).
    // Write operations still require settings permission.
    Route::prefix('custom-fields')->middleware('throttle:60,1')->group(function () {
        Route::get('/show/{id}', [SettingController::class, 'showCustomField'])->middleware('perm:items|composite_items,view,allow_party');
        Route::get('/{module}',  [SettingController::class, 'indexCustomFields'])->middleware('perm:items|composite_items,view,allow_party');
        Route::post('/',         [SettingController::class, 'storeCustomField'])->middleware(['throttle:20,1', 'perm:settings,create']);
        Route::put('/{id}',      [SettingController::class, 'updateCustomField'])->middleware(['throttle:20,1', 'perm:settings,edit']);
        Route::delete('/{id}',   [SettingController::class, 'destroyCustomField'])->middleware(['throttle:10,1', 'perm:settings,delete']);
    });

    // ── Countries ─────────────────────────────────────────────────────────────
    Route::prefix('countries')->middleware(['throttle:60,1', 'perm:locations,view'])->group(function () {
        Route::get('/',          [CountryController::class, 'index']);
        Route::get('/suggest',   [CountryController::class, 'suggest']);
        Route::get('/{country}', [CountryController::class, 'show']);
        Route::post('/',              [CountryController::class, 'store'])->middleware(['throttle:60,1', 'perm:locations,create']);
        Route::put('/{country}',      [CountryController::class, 'update'])->middleware(['throttle:60,1', 'perm:locations,edit']);
        Route::delete('/{country}',   [CountryController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:locations,delete']);
        Route::delete('/',            [CountryController::class, 'bulkDestroy'])->middleware(['throttle:60,1', 'perm:locations,delete']);
        Route::post('/bulk-restore',  [CountryController::class, 'bulkRestore'])->middleware(['throttle:60,1', 'perm:locations,edit']);
        Route::post('/{id}/restore',  [CountryController::class, 'restore'])->middleware(['throttle:60,1', 'perm:locations,edit']);

        // Layer schema
        Route::get('/{country}/layer-schema',            [LocationLayerSchemaController::class, 'index']);
        Route::post('/{country}/layer-schema',           [LocationLayerSchemaController::class, 'store'])->middleware(['throttle:60,1', 'perm:locations,edit']);
        Route::delete('/{country}/layer-schema/{depth}', [LocationLayerSchemaController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:locations,edit']);
    });

    // ── Distribution Location Nodes ───────────────────────────────────────────
    Route::prefix('distribution-location-nodes')->middleware('throttle:60,1')->group(function () {
        Route::get('/',                                     [DistributionLocationNodeController::class, 'index'])->middleware('perm:locations,view,allow_party');
        Route::get('/{distributionLocationNode}/ancestors', [DistributionLocationNodeController::class, 'ancestors'])->middleware('perm:locations,view,allow_party');
        Route::post('/',                                    [DistributionLocationNodeController::class, 'store'])->middleware(['throttle:60,1', 'perm:locations,create']);
        Route::put('/{distributionLocationNode}',           [DistributionLocationNodeController::class, 'update'])->middleware(['throttle:60,1', 'perm:locations,edit']);
        Route::post('/bulk-restore',                        [DistributionLocationNodeController::class, 'bulkRestore'])->middleware(['throttle:60,1', 'perm:locations,edit']);
        Route::post('/{id}/restore',                        [DistributionLocationNodeController::class, 'restore'])->middleware(['throttle:60,1', 'perm:locations,edit']);
        Route::delete('/{distributionLocationNode}',        [DistributionLocationNodeController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:locations,delete']);
        Route::delete('/',                                  [DistributionLocationNodeController::class, 'bulkDestroy'])->middleware(['throttle:60,1', 'perm:locations,delete']);
    });

    // ── Invoices ──────────────────────────────────────────────────────────────
    Route::get('invoices/{invoiceId}/activity', [CustomerActivityLogController::class, 'forInvoice'])->middleware(['throttle:60,1', 'perm:invoices,view']);
    Route::prefix('invoices')->middleware('throttle:60,1')->group(function () {
        Route::get('/',                                  [InvoiceController::class, 'index'])->middleware('perm:invoices,view');
        Route::get('/check-number',                      [InvoiceController::class, 'checkNumber'])->middleware('perm:invoices,view');
        Route::get('/{invoice}',                         [InvoiceController::class, 'show'])->middleware('perm:invoices,view');
        Route::post('/',                                 [InvoiceController::class, 'store'])->middleware(['throttle:30,1', 'perm:invoices,create']);
        Route::post('/{invoice}/stock-impact',           [InvoiceController::class, 'stockImpact'])->middleware(['throttle:60,1', 'perm:invoices,create']);
        Route::post('/{invoice}/attachments',            [InvoiceController::class, 'uploadAttachment'])->middleware(['throttle:60,1', 'perm:invoices,create']);
        Route::post('/{invoice}/apply-advance',          [InvoiceController::class, 'applyAdvance'])->middleware(['throttle:60,1', 'perm:invoices,edit']);
        Route::post('/{invoice}/apply-credit',           [InvoiceController::class, 'applyCredit'])->middleware(['throttle:60,1', 'perm:invoices,edit']);
        Route::post('/{invoice}/apply-available-credits',[InvoiceController::class, 'applyAvailableCredits'])->middleware(['throttle:60,1', 'perm:invoices,edit']);
        Route::put('/{invoice}',                         [InvoiceController::class, 'update'])->middleware(['throttle:60,1', 'perm:invoices,edit']);
        Route::patch('/{invoice}/void',                  [InvoiceController::class, 'void'])->middleware(['throttle:60,1', 'perm:invoices,edit']);
        Route::post('/{id}/restore',                     [InvoiceController::class, 'restore'])->middleware(['throttle:60,1', 'perm:invoices,edit']);
        Route::delete('/{invoice}',                      [InvoiceController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:invoices,delete']);
        Route::delete('/{invoice}/attachments/{attachment}',  [InvoiceController::class, 'deleteAttachment'])->middleware(['throttle:60,1', 'perm:invoices,delete']);
        Route::delete('/{invoice}/credit-applications',       [InvoiceController::class, 'removeCreditApplications'])->middleware(['throttle:60,1', 'perm:invoices,edit']);
    });

    // ── Credit Notes ─────────────────────────────────────────────────────────
    Route::get('credit-notes/{creditNoteId}/activity', [CustomerActivityLogController::class, 'forCreditNote'])->middleware(['throttle:60,1', 'perm:credit_notes,view']);
    Route::prefix('credit-notes')->middleware('throttle:60,1')->group(function () {
        Route::get('/',                                               [CreditNoteController::class, 'index'])->middleware('perm:credit_notes,view');
        Route::get('/{creditNote}',                                   [CreditNoteController::class, 'show'])->middleware('perm:credit_notes,view');
        Route::post('/',                                              [CreditNoteController::class, 'store'])->middleware(['throttle:60,1', 'perm:credit_notes,create']);
        Route::post('/{creditNote}/attachments',                      [CreditNoteController::class, 'uploadAttachment'])->middleware(['throttle:60,1', 'perm:credit_notes,create']);
        Route::delete('/{creditNote}',                                [CreditNoteController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:credit_notes,delete']);
        Route::delete('/{creditNote}/attachments/{attachment}',       [CreditNoteController::class, 'deleteAttachment'])->middleware(['throttle:60,1', 'perm:credit_notes,delete']);
    });

    // ── Payments ──────────────────────────────────────────────────────────────
    Route::get('payments/{paymentId}/activity', [CustomerActivityLogController::class, 'forPayment'])->middleware(['throttle:60,1', 'perm:payments,view']);
    Route::prefix('payments')->middleware('throttle:60,1')->group(function () {
        Route::get('/next-number',                           [PaymentController::class, 'nextNumber'])->middleware('perm:payments,view');
        Route::get('/advance-balance/{customerId}',          [PaymentController::class, 'advanceBalance'])->middleware('perm:payments,view');
        Route::get('/',                                      [PaymentController::class, 'index'])->middleware('perm:payments,view');
        Route::get('/{payment}',                             [PaymentController::class, 'show'])->middleware('perm:payments,view');
        Route::get('/{payment}/refunds',                     [PaymentController::class, 'listRefunds'])->middleware('perm:payments,view');
        Route::post('/',                                     [PaymentController::class, 'store'])->middleware(['throttle:60,1', 'perm:payments,create']);
        Route::post('/{payment}/attachments',                [PaymentController::class, 'uploadAttachment'])->middleware(['throttle:60,1', 'perm:payments,create']);
        Route::post('/{payment}/refund',                     [PaymentController::class, 'storeRefund'])->middleware(['throttle:60,1', 'perm:payments,create']);
        Route::put('/{payment}',                             [PaymentController::class, 'update'])->middleware(['throttle:60,1', 'perm:payments,edit']);
        Route::put('/{payment}/refunds/{refund}',            [PaymentController::class, 'updateRefund'])->middleware(['throttle:60,1', 'perm:payments,edit']);
        Route::post('/{payment}/apply',                      [PaymentController::class, 'apply'])->middleware(['throttle:60,1', 'perm:payments,edit']);
        Route::post('/{id}/restore',                         [PaymentController::class, 'restore'])->middleware(['throttle:60,1', 'perm:payments,edit']);
        Route::delete('/{payment}',                          [PaymentController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:payments,delete']);
        Route::delete('/{payment}/apply/{invoice}',          [PaymentController::class, 'unapply'])->middleware(['throttle:60,1', 'perm:payments,edit']);
        Route::delete('/{payment}/attachments/{attachment}', [PaymentController::class, 'deleteAttachment'])->middleware(['throttle:60,1', 'perm:payments,delete']);
        Route::delete('/{payment}/refunds/{refund}',         [PaymentController::class, 'destroyRefund'])->middleware(['throttle:60,1', 'perm:payments,delete']);
    });

    // ── Customer Credits ──────────────────────────────────────────────────────
    Route::prefix('customer-credits')->middleware(['throttle:60,1', 'perm:payments,view'])->group(function () {
        Route::get('/balance/{customerId}',           [CustomerCreditController::class, 'balance']);
        Route::get('/available-balance/{customerId}', [CustomerCreditController::class, 'availableBalance']);
    });

    // ── Taxes ─────────────────────────────────────────────────────────────────
    Route::prefix('taxes')->middleware(['throttle:60,1', 'perm:settings,view'])->group(function () {
        Route::get('/',          [TaxController::class, 'index']);
        Route::post('/',         [TaxController::class, 'store'])->middleware(['throttle:60,1', 'perm:settings,create']);
        Route::put('/{tax}',     [TaxController::class, 'update'])->middleware(['throttle:60,1', 'perm:settings,edit']);
        Route::delete('/{tax}',  [TaxController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:settings,delete']);
    });

    // ── Invoice References ────────────────────────────────────────────────────
    Route::prefix('invoice-references')->middleware(['throttle:60,1', 'perm:settings,view'])->group(function () {
        Route::get('/',                              [InvoiceReferenceController::class, 'index']);
        Route::post('/',                             [InvoiceReferenceController::class, 'store'])->middleware(['throttle:60,1', 'perm:settings,create']);
        Route::put('/{invoiceReference}',            [InvoiceReferenceController::class, 'update'])->middleware(['throttle:60,1', 'perm:settings,edit']);
        Route::delete('/{invoiceReference}',         [InvoiceReferenceController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:settings,delete']);
    });

    // ── Roles & Permissions ───────────────────────────────────────────────────
    Route::prefix('roles')->middleware('throttle:60,1')->group(function () {
        Route::get('/',          [RoleController::class, 'index'])->middleware('perm:roles,view');
        Route::get('/{role}',    [RoleController::class, 'show'])->middleware('perm:roles,view');
        Route::post('/',         [RoleController::class, 'store'])->middleware(['throttle:60,1', 'perm:roles,create']);
        Route::put('/{role}',    [RoleController::class, 'update'])->middleware(['throttle:60,1', 'perm:roles,edit']);
        Route::delete('/{role}', [RoleController::class, 'destroy'])->middleware(['throttle:60,1', 'perm:roles,delete']);
    });

}); // end auth:sanctum
