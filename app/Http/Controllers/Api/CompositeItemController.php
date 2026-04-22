<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCompositeItemRequest;
use App\Http\Requests\UpdateCompositeItemRequest;
use App\Models\AuditLog;
use App\Models\CompositeItemComponent;
use App\Models\CustomField;
use App\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class CompositeItemController extends Controller
{
    /**
     * Relationships loaded on every detail response.
     * Each component includes its linked item (name, image, type) for display.
     */
    private const DETAIL_WITH = ['components.componentItem'];

    // ────────────────────────────────────────────────────────────────────────────
    // READ
    // ────────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/composite-items
     * Paginated list of composite items with lightweight fields.
     */
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CompositeItemController::index');

        try {
            $query = Item::composite()
                ->select([
                    'id', 'name', 'item_type', 'composite_type', 'sku',
                    'selling_price', 'cost_price', 'image', 'refs',
                    'track_inventory', 'reorder_point', 'created_at',
                ])
                ->with([
                    'components' => fn ($q) => $q
                        ->select(['id', 'composite_item_id', 'component_item_id', 'component_type', 'quantity', 'sort_order'])
                        ->orderBy('sort_order')
                        ->with(['componentItem' => fn ($q2) => $q2->select(['id', 'name', 'item_type', 'sku', 'unit'])]),
                ])
                ->when(
                    $request->filled('search'),
                    fn ($q) => $q->search($request->query('search'))
                )
                ->when(
                    $request->filled('composite_type'),
                    fn ($q) => $q->where('composite_type', $request->query('composite_type'))
                )
                ->when(
                    $request->boolean('trashed'),
                    fn ($q) => $q->onlyTrashed()
                )
                ->latest();

            $perPage = max(1, min((int) $request->query('per_page', 20), 100));
            $items   = $query->paginate($perPage);

            return $this->successResponse(['data' => $items]);

        } catch (Throwable $e) {
            $this->logException('CompositeItemController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch composite items.', 500);
        }
    }

    /**
     * GET /api/composite-items/{compositeItem}
     * Full detail including all components and their linked items.
     */
    public function show(Request $request, int $compositeItem): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CompositeItemController::show', ['item_id' => $compositeItem]);

        try {
            $record = Item::composite()
                ->withTrashed()
                ->with(self::DETAIL_WITH)
                ->findOrFail($compositeItem);

            return $this->successResponse(['data' => $record]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Composite item not found.', 404);
        } catch (Throwable $e) {
            $this->logException('CompositeItemController::show', $e, $ctx);
            return $this->errorResponse('Failed to fetch composite item.', 500);
        }
    }

    // ────────────────────────────────────────────────────────────────────────────
    // WRITE
    // ────────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/composite-items
     * Create a composite item with its component rows in a single transaction.
     */
    public function store(StoreCompositeItemRequest $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CompositeItemController::store');
        Log::info('[CompositeItemController] Store started', $ctx);

        try {
            $data       = $request->validated();
            $components = $data['components'] ?? [];
            unset($data['components']);

            // Force composite flags regardless of what the client sent
            $data['is_composite']  = true;
            $data['form_type']   ??= 'single';
            $data['item_type']   ??= 'goods';

            // Resolve auto_generate custom fields
            $data['custom_fields'] = $this->resolveAutoGenerateFields(
                $data['custom_fields'] ?? [],
                'products'
            );

            DB::beginTransaction();

            $item = Item::create($data);

            foreach ($components as $i => $comp) {
                $item->components()->create([
                    'component_item_id' => (int) $comp['component_item_id'],
                    'component_type'    => $comp['component_type'],
                    'quantity'          => (float) $comp['quantity'],
                    'selling_price'     => isset($comp['selling_price']) ? (float) $comp['selling_price'] : null,
                    'cost_price'        => isset($comp['cost_price'])    ? (float) $comp['cost_price']    : null,
                    'sort_order'        => $comp['sort_order'] ?? $i,
                ]);
            }

            DB::commit();

            Log::info('[CompositeItemController] Store success', array_merge($ctx, ['item_id' => $item->id]));

            return $this->successResponse([
                'message' => 'Composite item created successfully.',
                'data'    => $item->load(self::DETAIL_WITH),
            ], 201);

        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('CompositeItemController::store', $e, $ctx);
            return $this->errorResponse('Failed to create composite item. Please try again.', 500);
        }
    }

    /**
     * PUT /api/composite-items/{compositeItem}
     * Update core fields and optionally replace all component rows.
     * If the 'components' key is absent from the request, existing components are left untouched.
     */
    public function update(UpdateCompositeItemRequest $request, int $compositeItem): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CompositeItemController::update', ['item_id' => $compositeItem]);
        Log::info('[CompositeItemController] Update started', $ctx);

        try {
            $record = Item::composite()->findOrFail($compositeItem);

            $data           = $request->validated();
            $componentsKey  = array_key_exists('components', $data);
            $components     = $data['components'] ?? [];
            unset($data['components']);

            // Never allow stripping composite flag via update
            unset($data['is_composite']);

            // Prevent phantom audit entries from JSON re-serialisation
            foreach (['refs', 'custom_fields', 'dimensions', 'weight', 'identifiers'] as $col) {
                if (array_key_exists($col, $data) && $record->{$col} == $data[$col]) {
                    unset($data[$col]);
                }
            }

            DB::beginTransaction();

            $record->update($data);

            // Sync components only when the key was explicitly sent
            if ($componentsKey) {
                $this->syncComponents($record, $components);
            }

            DB::commit();

            Log::info('[CompositeItemController] Update success', array_merge($ctx, ['item_id' => $record->id]));

            return $this->successResponse([
                'message' => 'Composite item updated successfully.',
                'data'    => $record->fresh(self::DETAIL_WITH),
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Composite item not found.', 404);
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('CompositeItemController::update', $e, $ctx);
            return $this->errorResponse('Failed to update composite item. Please try again.', 500);
        }
    }

    /**
     * DELETE /api/composite-items/{compositeItem}
     * Soft-delete the composite item (components stay for audit; inaccessible while parent is trashed).
     */
    public function destroy(Request $request, int $compositeItem): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CompositeItemController::destroy', ['item_id' => $compositeItem]);

        try {
            $record = Item::composite()->findOrFail($compositeItem);

            DB::beginTransaction();
            $record->delete();
            DB::commit();

            Log::info('[CompositeItemController] Soft-deleted', $ctx);
            return $this->successResponse(['message' => 'Composite item deleted successfully.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Composite item not found.', 404);
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('CompositeItemController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete composite item.', 500);
        }
    }

    /**
     * POST /api/composite-items/{compositeItem}/restore
     * Restore a soft-deleted composite item.
     */
    public function restore(Request $request, int $compositeItem): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CompositeItemController::restore', ['item_id' => $compositeItem]);

        try {
            $record = Item::composite()->onlyTrashed()->findOrFail($compositeItem);

            DB::beginTransaction();
            $record->restore();
            DB::commit();

            Log::info('[CompositeItemController] Restored', $ctx);
            return $this->successResponse(['message' => 'Composite item restored successfully.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Deleted composite item not found.', 404);
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('CompositeItemController::restore', $e, $ctx);
            return $this->errorResponse('Failed to restore composite item.', 500);
        }
    }

    // ────────────────────────────────────────────────────────────────────────────
    // FILE UPLOAD
    // ────────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/composite-items/upload-image
     * Accepts a JPEG file, stores it, returns path + URL.
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|file|mimes:jpeg,jpg|max:2048',
        ]);

        try {
            $filename = 'items/' . Str::uuid() . '.jpg';
            Storage::disk('public')->put(
                $filename,
                file_get_contents($request->file('image')->getRealPath())
            );

            return $this->successResponse([
                'path' => $filename,
                'url'  => Storage::disk('public')->url($filename),
            ], 201);

        } catch (Throwable $e) {
            Log::error('[CompositeItemController::uploadImage] ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return $this->errorResponse('Image upload failed. Please try again.', 500);
        }
    }

    // ────────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ────────────────────────────────────────────────────────────────────────────

    /**
     * Delete existing component rows for $item and recreate from $components array.
     * Wrapped in the caller's transaction — do NOT open a nested transaction here.
     */
    private function syncComponents(Item $item, array $components): void
    {
        // Hard-delete the current components (no soft-delete on this table)
        $item->components()->delete();

        foreach ($components as $i => $comp) {
            $item->components()->create([
                'component_item_id' => (int) $comp['component_item_id'],
                'component_type'    => $comp['component_type'],
                'quantity'          => (float) $comp['quantity'],
                'selling_price'     => isset($comp['selling_price']) ? (float) $comp['selling_price'] : null,
                'cost_price'        => isset($comp['cost_price'])    ? (float) $comp['cost_price']    : null,
                'sort_order'        => $comp['sort_order'] ?? $i,
            ]);
        }
    }

    /**
     * For every active auto_generate custom field in the given module,
     * compute and inject the next sequence value into $customFields
     * if the field does not already have a value.
     */
    private function resolveAutoGenerateFields(array $customFields, string $module): array
    {
        $fields = CustomField::where('module', $module)
            ->get()
            ->filter(fn ($f) =>
                ($f->config['is_active'] ?? false) &&
                ($f->config['data_type'] ?? '') === 'auto_generate'
            );

        foreach ($fields as $field) {
            $fieldKey = $field->config['field_key'] ?? null;
            if (!$fieldKey || !empty($customFields[$fieldKey])) {
                continue;
            }

            $tc     = $field->config['type_config'] ?? [];
            $prefix = $tc['prefix']          ?? '';
            $start  = (int) ($tc['starting_number'] ?? 1);
            $suffix = $tc['suffix']          ?? '';

            $jsonPath = '$.' . $fieldKey;
            $count = Item::withTrashed()
                ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(`custom_fields`, ?)) IS NOT NULL", [$jsonPath])
                ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(`custom_fields`, ?)) != ''",      [$jsonPath])
                ->count();

            $number = $start + $count;
            $padded = str_pad($number, 3, '0', STR_PAD_LEFT);
            $parts  = array_values(array_filter([$prefix, $padded, $suffix], fn ($p) => $p !== ''));

            $customFields[$fieldKey] = implode('-', $parts);
        }

        return $customFields;
    }
}
