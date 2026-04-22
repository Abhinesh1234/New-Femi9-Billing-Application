<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePriceListRequest;
use App\Http\Requests\UpdatePriceListRequest;
use App\Models\AuditLog;
use App\Models\Item;
use App\Models\PriceList;
use App\Models\PriceListItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class PriceListController extends Controller
{
    /**
     * GET /api/price-lists
     */
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PriceListController::index');

        try {
            $query = PriceList::select([
                    'id', 'name', 'transaction_type', 'price_list_type',
                    'customer_category_id', 'is_active', 'created_at', 'updated_at',
                ])
                ->when($request->filled('search'), function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->query('search') . '%');
                })
                ->when($request->filled('transaction_type'), function ($q) use ($request) {
                    $q->where('transaction_type', $request->query('transaction_type'));
                })
                ->when($request->filled('price_list_type'), function ($q) use ($request) {
                    $q->where('price_list_type', $request->query('price_list_type'));
                })
                ->latest();

            $perPage = max(1, min((int) $request->query('per_page', 20), 100));
            $lists   = $query->paginate($perPage);

            return $this->successResponse(['data' => $lists]);

        } catch (Throwable $e) {
            $this->logException('PriceListController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch price lists.', 500);
        }
    }

    /**
     * POST /api/price-lists
     */
    public function store(StorePriceListRequest $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PriceListController::store');

        try {
            $data  = $request->validated();
            $rows  = $data['items'] ?? [];
            unset($data['items']);

            $data['created_by'] = $request->user()?->id;

            DB::beginTransaction();

            $priceList = PriceList::create($data);

            foreach ($rows as $row) {
                $priceList->items()->create([
                    'item_id'       => $row['item_id'],
                    'custom_rate'   => $row['custom_rate']   ?? null,
                    'discount'      => $row['discount']      ?? null,
                    'volume_ranges' => $row['volume_ranges'] ?? null,
                ]);
            }

            DB::commit();

            Log::info('[PriceListController] Created', array_merge($ctx, [
                'price_list_id' => $priceList->id,
                'item_count'    => count($rows),
            ]));

            return $this->successResponse(
                [
                    'message' => 'Price list created successfully.',
                    'data'    => $priceList->load('items'),
                ],
                201
            );

        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('PriceListController::store', $e, $ctx);
            return $this->errorResponse('Failed to create price list. Please try again.', 500);
        }
    }

    /**
     * GET /api/price-lists/{priceList}
     */
    public function show(Request $request, int $priceList): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PriceListController::show', ['price_list_id' => $priceList]);

        try {
            $record = PriceList::with('items')->findOrFail($priceList);
            return $this->successResponse(['data' => $record]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Price list not found.', 404);
        } catch (Throwable $e) {
            $this->logException('PriceListController::show', $e, $ctx);
            return $this->errorResponse('Failed to fetch price list.', 500);
        }
    }

    /**
     * PUT /api/price-lists/{priceList}
     */
    public function update(UpdatePriceListRequest $request, int $priceList): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PriceListController::update', ['price_list_id' => $priceList]);

        try {
            $record = PriceList::findOrFail($priceList);
            $data   = $request->validated();
            $rows   = $data['items'] ?? null;
            unset($data['items']);

            // Prevents phantom audit entries caused by JSON re-serialisation
            if (array_key_exists('settings', $data) && $record->settings == $data['settings']) {
                unset($data['settings']);
            }

            // Snapshot item pricing before delete so we can diff it afterwards
            $beforeItems = $rows !== null
                ? $record->items()
                    ->select(['item_id', 'custom_rate', 'discount', 'volume_ranges'])
                    ->get()->keyBy(fn($i) => (int) $i->item_id)
                : collect();

            DB::beginTransaction();

            $record->update($data);

            // If item rows were sent, replace them entirely
            if ($rows !== null) {
                $record->items()->delete();
                foreach ($rows as $row) {
                    $record->items()->create([
                        'item_id'       => $row['item_id'],
                        'custom_rate'   => $row['custom_rate']   ?? null,
                        'discount'      => $row['discount']      ?? null,
                        'volume_ranges' => $row['volume_ranges'] ?? null,
                    ]);
                }
                try {
                    $this->logPriceListItemChanges($record, $beforeItems, $rows);
                } catch (\Throwable $auditErr) {
                    \Illuminate\Support\Facades\Log::error('[PriceListController] Item pricing audit failed', [
                        'price_list_id' => $record->id,
                        'error'         => $auditErr->getMessage(),
                    ]);
                }
            }

            DB::commit();

            Log::info('[PriceListController] Updated', $ctx);

            return $this->successResponse([
                'message' => 'Price list updated successfully.',
                'data'    => $record->load('items'),
            ]);

        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('PriceListController::update', $e, $ctx);
            return $this->errorResponse('Failed to update price list. Please try again.', 500);
        }
    }

    /**
     * DELETE /api/price-lists/{priceList}
     */
    public function destroy(Request $request, int $priceList): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PriceListController::destroy', ['price_list_id' => $priceList]);

        try {
            $record = PriceList::findOrFail($priceList);
            $record->delete();
            Log::info('[PriceListController] Deleted', $ctx);
            return $this->successResponse(['message' => 'Price list deleted successfully.']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Price list not found.', 404);
        } catch (Throwable $e) {
            $this->logException('PriceListController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete price list.', 500);
        }
    }

    /**
     * Diff before/after price list items and write a single audit_logs entry.
     * Item IDs are resolved to names so the history UI needs no further lookups.
     *
     * @param  \Illuminate\Support\Collection  $before  PriceListItem models keyed by item_id
     * @param  array<int,array>               $afterRows  Raw request rows (item_id, custom_rate, …)
     */
    private function logPriceListItemChanges(PriceList $priceList, \Illuminate\Support\Collection $before, array $afterRows): void
    {
        // Key after rows by item_id
        $afterMap = [];
        foreach ($afterRows as $row) {
            $afterMap[(int) $row['item_id']] = $row;
        }

        $beforeIds = $before->keys()->map(fn($id) => (int) $id)->all();
        $afterIds  = array_map('intval', array_keys($afterMap));
        $allIds    = array_unique(array_merge($beforeIds, $afterIds));

        if (empty($allIds)) return;

        // Batch-fetch names — use withTrashed in case an item was soft-deleted
        $itemNames = Item::withTrashed()->whereIn('id', $allIds)->pluck('name', 'id');

        $oldLog = [];
        $newLog = [];

        foreach ($allIds as $itemId) {
            $itemName  = $itemNames[$itemId] ?? "Item #{$itemId}";
            $beforeRow = $before->get($itemId);
            $afterRow  = $afterMap[$itemId] ?? null;

            if ($beforeRow === null) {
                // Newly added item
                $oldLog[$itemName] = null;
                $newLog[$itemName] = $this->pliSnapshot($afterRow);
            } elseif ($afterRow === null) {
                // Removed item
                $oldLog[$itemName] = $this->pliSnapshot($beforeRow);
                $newLog[$itemName] = null;
            } else {
                // Potentially changed
                $bSnap = $this->pliSnapshot($beforeRow);
                $aSnap = $this->pliSnapshot($afterRow);

                $changed =
                    (float) ($bSnap['custom_rate']  ?? 0) !== (float) ($aSnap['custom_rate']  ?? 0) ||
                    (float) ($bSnap['discount']      ?? 0) !== (float) ($aSnap['discount']      ?? 0) ||
                    json_encode($bSnap['volume_ranges']) !== json_encode($aSnap['volume_ranges']);

                if ($changed) {
                    $oldLog[$itemName] = $bSnap;
                    $newLog[$itemName] = $aSnap;
                }
            }
        }

        if (empty($oldLog) && empty($newLog)) return;

        $req = request();
        AuditLog::create([
            'auditable_type' => 'price_lists',
            'auditable_id'   => $priceList->id,
            'event'          => 'updated',
            'user_id'        => $req->user()?->id,
            'ip_address'     => $req->ip(),
            'user_agent'     => $req->userAgent(),
            'old_values'     => ['price_list_items' => $oldLog],
            'new_values'     => ['price_list_items' => $newLog],
        ]);
    }

    /** Normalise a PriceListItem model or raw request array into a plain snapshot. */
    private function pliSnapshot(mixed $v): array
    {
        if ($v instanceof PriceListItem) {
            return [
                'custom_rate'   => $v->custom_rate,
                'discount'      => $v->discount,
                'volume_ranges' => $v->volume_ranges,
            ];
        }
        return [
            'custom_rate'   => $v['custom_rate']   ?? null,
            'discount'      => $v['discount']      ?? null,
            'volume_ranges' => $v['volume_ranges'] ?? null,
        ];
    }
}
