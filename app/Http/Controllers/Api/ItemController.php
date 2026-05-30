<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreItemRequest;
use App\Http\Requests\UpdateItemRequest;
use App\Models\AuditLog;
use App\Models\CompositeItemComponent;
use App\Models\CustomField;
use App\Models\Item;
use App\Models\ItemVariant;
use App\Models\PartyItemReorderPoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;


class ItemController extends Controller
{
    // No eager-loadable FK relations — all resolved via refs accessors on demand

    // Only non-refs relationships can be eager-loaded
    private const DETAIL_WITH = ['variants', 'components.componentItem'];

    /**
     * GET /api/items
     * Paginated list with search + filters.
     */
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'ItemController::index');

        try {
            $isParty = (bool) $request->attributes->get('party_scope_id');

            $query = Item::select([
                    'id', 'name', 'item_type', 'form_type', 'sku', 'unit',
                    'selling_price', 'cost_price', 'image', 'refs',
                    'track_inventory', 'reorder_point', 'created_at',
                    'is_composite', 'composite_type',
                ])
                ->with([
                    'components' => fn ($q) => $q
                        ->select(['id', 'composite_item_id', 'component_item_id', 'component_type', 'quantity', 'sort_order'])
                        ->orderBy('sort_order')
                        ->with(['componentItem' => fn ($q2) => $q2->select(['id', 'name', 'item_type', 'sku', 'unit'])]),
                ])
                ->when($isParty, fn($q) => $q->where('admin_only', false))
                ->search($request->query('search'))
                ->ofType($request->query('item_type'))
                ->when($request->boolean('exclude_composite'), fn($q) => $q->where('is_composite', false))
                ->when($request->filled('trashed') && $request->boolean('trashed'), fn($q) => $q->onlyTrashed())
                ->latest();

            $perPage = max(1, min((int) $request->query('per_page', 20), 1000));
            $items   = $query->paginate($perPage);

            // For party users, replace the company-level reorder_point with the
            // party's own value from party_item_reorder_points (null if not set).
            $partyScopeId = $request->attributes->get('party_scope_id');
            if ($partyScopeId) {
                $partyReorders = PartyItemReorderPoint::where('party_id', $partyScopeId)
                    ->whereIn('item_id', $items->pluck('id'))
                    ->pluck('reorder_point', 'item_id');

                $items->getCollection()->each(function ($item) use ($partyReorders) {
                    $item->reorder_point = $partyReorders->has($item->id)
                        ? (float) $partyReorders->get($item->id)
                        : null;
                });
            }

            return $this->successResponse(['data' => $items]);

        } catch (Throwable $e) {
            $this->logException('ItemController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch items.', 500);
        }
    }

    /**
     * POST /api/items
     */
    public function store(StoreItemRequest $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'ItemController::store');
        Log::info('[ItemController] Store started', $ctx);

        try {
            $data       = $request->validated();
            $variants   = $data['variants']   ?? [];
            $components = $data['components'] ?? [];
            unset($data['variants'], $data['components']);

            // Resolve auto_generate custom fields before persisting
            $data['custom_fields'] = $this->resolveAutoGenerateFields(
                $data['custom_fields'] ?? [],
                'products'
            );

            DB::beginTransaction();

            $item = Item::create($data);

            foreach ($variants as $i => $variantData) {
                $item->variants()->create(array_merge($variantData, ['sort_order' => $i]));
            }

            foreach ($components as $i => $comp) {
                $item->components()->create(array_merge($comp, ['sort_order' => $comp['sort_order'] ?? $i]));
            }

            DB::commit();

            Log::info('[ItemController] Store success', array_merge($ctx, ['item_id' => $item->id]));

            return $this->successResponse(
                ['message' => 'Item created successfully.', 'data' => $item->load(self::DETAIL_WITH)],
                201
            );

        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('ItemController::store', $e, $ctx);
            return $this->errorResponse('Failed to create item. Please try again.', 500);
        }
    }

    /**
     * GET /api/items/{item}
     */
    public function show(Request $request, int $item): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'ItemController::show', ['item_id' => $item]);

        try {
            $record = Item::withTrashed()->with(self::DETAIL_WITH)->findOrFail($item);

            return $this->successResponse(['data' => $record]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Item not found.', 404);
        } catch (Throwable $e) {
            $this->logException('ItemController::show', $e, $ctx);
            return $this->errorResponse('Failed to fetch item.', 500);
        }
    }

    /**
     * PUT /api/items/{item}
     */
    public function update(UpdateItemRequest $request, int $item): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'ItemController::update', ['item_id' => $item]);
        Log::info('[ItemController] Update started', $ctx);

        try {
            $record     = Item::findOrFail($item);
            $data       = $request->validated();
            $variants   = $data['variants']   ?? null;
            $components = array_key_exists('components', $data) ? $data['components'] : false;
            unset($data['variants'], $data['components']);

            // ── Strip JSON columns that haven't logically changed ─────────────────
            // Prevents phantom audit entries caused by JSON re-serialisation
            // (PHP == on associative arrays is order-insensitive, perfect for this).
            foreach (['refs', 'variation_config', 'custom_fields', 'dimensions', 'weight', 'identifiers'] as $col) {
                if (array_key_exists($col, $data) && $record->{$col} == $data[$col]) {
                    unset($data[$col]);
                }
            }

            DB::beginTransaction();

            $record->update($data);

            // Sync components when explicitly provided (false = not sent = leave untouched)
            if ($components !== false) {
                $record->components()->delete();
                foreach (($components ?? []) as $i => $comp) {
                    $record->components()->create(array_merge($comp, ['sort_order' => $comp['sort_order'] ?? $i]));
                }
            }

            // Sync variants when explicitly provided
            if ($variants !== null) {
                // Snapshot current variants BEFORE deletion (for the audit diff).
                $beforeVariants = $record->variants()
                    ->select(['combo_key', 'name', 'sku', 'cost_price', 'selling_price'])
                    ->get()
                    ->keyBy('combo_key');

                // Hard-delete and recreate (soft-delete blocks the unique constraint).
                $record->variants()->forceDelete();
                foreach ($variants as $i => $variantData) {
                    $record->variants()->create(array_merge($variantData, ['sort_order' => $i]));
                }

                // Write a single item-level audit entry for whatever changed in variants.
                $this->logVariantChanges($record, $beforeVariants, $variants);
            }

            DB::commit();

            Log::info('[ItemController] Update success', array_merge($ctx, ['item_id' => $record->id]));

            return $this->successResponse([
                'message' => 'Item updated successfully.',
                'data'    => $record->fresh(self::DETAIL_WITH),
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Item not found.', 404);
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('ItemController::update', $e, $ctx);
            return $this->errorResponse('Failed to update item. Please try again.', 500);
        }
    }

    /**
     * DELETE /api/items/{item}  — soft delete
     */
    public function destroy(Request $request, int $item): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'ItemController::destroy', ['item_id' => $item]);

        try {
            $record = Item::findOrFail($item);

            DB::beginTransaction();
            $record->variants()->delete();
            $record->delete();
            DB::commit();

            Log::info('[ItemController] Soft-deleted', $ctx);
            return $this->successResponse(['message' => 'Item deleted successfully.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Item not found.', 404);
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('ItemController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete item.', 500);
        }
    }

    /**
     * POST /api/items/upload-image
     * Re-encodes via GD (max 1200px, 85% JPEG) — prevents polyglot/malformed files.
     * Falls back to raw storage if GD is unavailable.
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|file|mimes:jpeg,jpg,png,gif,webp|max:5120',
        ]);

        try {
            $file     = $request->file('image');
            $filename = 'items/' . Str::uuid() . '.jpg';

            if (function_exists('imagecreatefromstring')) {
                $raw = file_get_contents($file->getRealPath());
                $src = imagecreatefromstring($raw);

                if ($src !== false) {
                    [$origW, $origH] = [imagesx($src), imagesy($src)];
                    $maxDim = 1200;

                    if ($origW > $maxDim || $origH > $maxDim) {
                        if ($origW >= $origH) {
                            $newW = $maxDim;
                            $newH = (int) round($maxDim * $origH / $origW);
                        } else {
                            $newH = $maxDim;
                            $newW = (int) round($maxDim * $origW / $origH);
                        }
                        $dst = imagecreatetruecolor($newW, $newH);
                        // Preserve transparency for PNG/GIF sources
                        imagealphablending($dst, false);
                        imagesavealpha($dst, true);
                        imagecopyresampled($dst, $src, 0, 0, 0, 0, $newW, $newH, $origW, $origH);
                        imagedestroy($src);
                        $src = $dst;
                    }

                    $tmp = tempnam(sys_get_temp_dir(), 'item_img_') . '.jpg';
                    imagejpeg($src, $tmp, 85);
                    imagedestroy($src);

                    Storage::disk('public')->put($filename, file_get_contents($tmp));
                    @unlink($tmp);

                    return $this->successResponse([
                        'path' => $filename,
                        'url'  => Storage::disk('public')->url($filename),
                    ], 201);
                }
            }

            // GD unavailable — store as-is (already validated mime type)
            Storage::disk('public')->put($filename, file_get_contents($file->getRealPath()));

            return $this->successResponse([
                'path' => $filename,
                'url'  => Storage::disk('public')->url($filename),
            ], 201);

        } catch (Throwable $e) {
            Log::error('[ItemController::uploadImage] ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return $this->errorResponse('Image upload failed. Please try again.', 500);
        }
    }

    /**
     * POST /api/items/upload-attachment
     * Accepts any allowed file type for custom field attachments.
     * - Images   → compressed to 85% JPEG via GD
     * - PDFs     → compressed via Ghostscript (ebook quality, ~85%) if available, else stored as-is
     * - DOCX/XLSX/PPTX → re-compressed at max deflate level via ZipArchive if available, else stored as-is
     * - Other    → stored as-is
     */
    public function uploadAttachment(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:10240|mimetypes:image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,text/plain,application/rtf',
        ]);

        try {
            $file = $request->file('file');
            $mime = $file->getMimeType();
            $ext  = strtolower($file->getClientOriginalExtension());
            $uuid = Str::uuid();

            // ── Images: compress to 85% JPEG via GD ──────────────────────────
            $imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (in_array($mime, $imageTypes, true) && function_exists('imagecreatefromstring')) {
                $src = imagecreatefromstring(file_get_contents($file->getRealPath()));
                if ($src !== false) {
                    $tmp = tempnam(sys_get_temp_dir(), 'cf_img_');
                    imagejpeg($src, $tmp, 85);
                    imagedestroy($src);

                    $filename = "custom-fields/{$uuid}.jpg";
                    Storage::disk('public')->put($filename, file_get_contents($tmp));
                    @unlink($tmp);

                    return $this->successResponse([
                        'path' => $filename,
                        'url'  => Storage::disk('public')->url($filename),
                    ], 201);
                }
            }

            // ── PDFs: compress via Ghostscript (ebook ~85% quality) ───────────
            if ($mime === 'application/pdf') {
                $filename    = "custom-fields/{$uuid}.pdf";
                $tmpOut      = $this->ghostscriptCompressPdf($file->getRealPath());
                $useOriginal = $tmpOut === null || filesize($tmpOut) >= filesize($file->getRealPath());
                Storage::disk('public')->put($filename, file_get_contents($useOriginal ? $file->getRealPath() : $tmpOut));
                if ($tmpOut !== null) @unlink($tmpOut);

                return $this->successResponse([
                    'path' => $filename,
                    'url'  => Storage::disk('public')->url($filename),
                ], 201);
            }

            // ── Office docs (DOCX, XLSX, PPTX): re-compress ZIP at max deflate ─
            $zipMimes = [
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            ];
            if (in_array($mime, $zipMimes, true)) {
                $filename    = "custom-fields/{$uuid}.{$ext}";
                $tmpOut      = $this->recompressZipFile($file->getRealPath(), $ext);
                $useOriginal = $tmpOut === null || filesize($tmpOut) >= filesize($file->getRealPath());
                Storage::disk('public')->put($filename, file_get_contents($useOriginal ? $file->getRealPath() : $tmpOut));
                if ($tmpOut !== null) @unlink($tmpOut);

                return $this->successResponse([
                    'path' => $filename,
                    'url'  => Storage::disk('public')->url($filename),
                ], 201);
            }

            // ── All other files (DOC, XLS, CSV, TXT, RTF, etc.): store as-is ─
            $filename = "custom-fields/{$uuid}.{$ext}";
            Storage::disk('public')->put($filename, file_get_contents($file->getRealPath()));

            return $this->successResponse([
                'path' => $filename,
                'url'  => Storage::disk('public')->url($filename),
            ], 201);

        } catch (Throwable $e) {
            Log::error('[ItemController::uploadAttachment] ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return $this->errorResponse('File upload failed. Please try again.', 500);
        }
    }

    /**
     * Compress a PDF using Ghostscript at "ebook" quality (~150 dpi images, ≥85% fidelity).
     * Returns the path to a temp file on success, or null if gs is unavailable or fails.
     */
    private function ghostscriptCompressPdf(string $inputPath): ?string
    {
        if (!function_exists('exec')) return null;

        exec('which gs 2>/dev/null', $out, $code);
        if ($code !== 0 || empty($out)) return null;

        $gs  = trim($out[0]);
        $tmp = tempnam(sys_get_temp_dir(), 'cf_pdf_') . '.pdf';

        $cmd = sprintf(
            '%s -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=%s %s 2>/dev/null',
            escapeshellarg($gs),
            escapeshellarg($tmp),
            escapeshellarg($inputPath)
        );
        exec($cmd, $cmdOut, $exitCode);

        if ($exitCode !== 0 || !file_exists($tmp) || filesize($tmp) === 0) {
            @unlink($tmp);
            return null;
        }

        return $tmp;
    }

    /**
     * Re-compress a ZIP-based Office document (DOCX, XLSX, PPTX) at maximum deflate level (level 9).
     * This is lossless — document content is never altered.
     * Returns the path to a temp file on success, or null if ZipArchive is unavailable or fails.
     */
    private function recompressZipFile(string $inputPath, string $ext): ?string
    {
        if (!class_exists('ZipArchive')) return null;

        $inZip = new \ZipArchive();
        if ($inZip->open($inputPath) !== true) return null;

        $tmp    = tempnam(sys_get_temp_dir(), 'cf_zip_') . '.' . $ext;
        $outZip = new \ZipArchive();
        if ($outZip->open($tmp, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            $inZip->close();
            return null;
        }

        for ($i = 0; $i < $inZip->numFiles; $i++) {
            $name    = $inZip->getNameIndex($i);
            $content = $inZip->getFromIndex($i);
            if ($content === false) continue;
            $outZip->addFromString($name, $content);
            $outZip->setCompressionName($name, \ZipArchive::CM_DEFLATE, 9);
        }

        $inZip->close();
        $outZip->close();

        if (!file_exists($tmp) || filesize($tmp) === 0) {
            @unlink($tmp);
            return null;
        }

        return $tmp;
    }

    /**
     * POST /api/items/{item}/restore
     */
    public function restore(Request $request, int $item): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'ItemController::restore', ['item_id' => $item]);

        try {
            $record = Item::onlyTrashed()->findOrFail($item);

            DB::beginTransaction();
            $record->restore();
            ItemVariant::onlyTrashed()->where('item_id', $item)->restore();
            DB::commit();

            Log::info('[ItemController] Restored', $ctx);
            return $this->successResponse(['message' => 'Item restored successfully.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Deleted item not found.', 404);
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('ItemController::restore', $e, $ctx);
            return $this->errorResponse('Failed to restore item.', 500);
        }
    }

    /**
     * GET /api/items/auto-generate-preview
     * Returns the next sequence value for every active auto_generate custom
     * field in the "products" module, keyed by field_key.
     */
    public function autoGeneratePreview(Request $request): JsonResponse
    {
        try {
            $preview = [];
            $this->resolveAutoGenerateFields([], 'products', $preview);
            return $this->successResponse(['data' => $preview]);
        } catch (Throwable $e) {
            $this->logException('ItemController::autoGeneratePreview', $e, []);
            return $this->errorResponse('Failed to generate preview.', 500);
        }
    }

    /**
     * Diff old vs new variants and write one item-level audit entry.
     * Only records what actually changed (add / remove / field-level edits).
     *
     * @param \Illuminate\Support\Collection $before  ItemVariant models keyed by combo_key
     * @param array                          $after   Validated request variant arrays
     */
    private function logVariantChanges(Item $item, \Illuminate\Support\Collection $before, array $after): void
    {
        $afterByKey = collect($after)->keyBy('combo_key');
        $allKeys    = $before->keys()->merge($afterByKey->keys())->unique();

        $oldLog = [];
        $newLog = [];

        foreach ($allKeys as $comboKey) {
            $old = $before->get($comboKey);        // ItemVariant or null
            $new = $afterByKey->get($comboKey);    // array or null

            if ($old === null) {
                // Variant was added
                $oldLog[$comboKey] = null;
                $newLog[$comboKey] = $this->variantSnapshot($new);
                continue;
            }

            if ($new === null) {
                // Variant was removed
                $oldLog[$comboKey] = $this->variantSnapshot($old);
                $newLog[$comboKey] = null;
                continue;
            }

            // Variant exists in both — diff field by field
            $changedOld = [];
            $changedNew = [];

            foreach (['name', 'sku'] as $f) {
                $ov = $old->{$f} ?? null;
                $nv = $new[$f]   ?? null;
                if ($ov !== $nv) { $changedOld[$f] = $ov; $changedNew[$f] = $nv; }
            }
            foreach (['cost_price', 'selling_price'] as $f) {
                $ov = $old->{$f} !== null ? (float) $old->{$f} : null;
                $nv = isset($new[$f]) && $new[$f] !== null ? (float) $new[$f] : null;
                if ($ov !== $nv) { $changedOld[$f] = $old->{$f}; $changedNew[$f] = $new[$f] ?? null; }
            }

            if (!empty($changedOld)) {
                $oldLog[$comboKey] = $changedOld;
                $newLog[$comboKey] = $changedNew;
            }
        }

        if (empty($newLog)) return;

        $partyUserId = request()?->attributes->get('party_user_id');

        AuditLog::create([
            'auditable_type' => $item->getTable(),
            'auditable_id'   => $item->id,
            'event'          => 'updated',
            'user_id'        => $partyUserId ? null : auth()->id(),
            'party_user_id'  => $partyUserId ?: null,
            'ip_address'     => request()?->ip(),
            'user_agent'     => request()?->userAgent(),
            'old_values'     => ['variants' => $oldLog],
            'new_values'     => ['variants' => $newLog],
        ]);
    }

    /** Extract audit-relevant fields from a variant (model or array). */
    private function variantSnapshot(mixed $v): array
    {
        if ($v instanceof ItemVariant) {
            return ['name' => $v->name, 'sku' => $v->sku, 'cost_price' => $v->cost_price, 'selling_price' => $v->selling_price];
        }
        return ['name' => $v['name'] ?? null, 'sku' => $v['sku'] ?? null, 'cost_price' => $v['cost_price'] ?? null, 'selling_price' => $v['selling_price'] ?? null];
    }

    /**
     * For every active auto_generate custom field in the given module,
     * compute and inject the next sequence value into $customFields
     * if the field does not already have a value.
     */
    private function resolveAutoGenerateFields(array $customFields, string $module, array &$preview = []): array
    {
        $fields = CustomField::where('module', $module)
            ->get()
            ->filter(fn($f) =>
                ($f->config['is_active']  ?? false) &&
                ($f->config['data_type']  ?? '')    === 'auto_generate'
            );

        foreach ($fields as $field) {
            $fieldKey = $field->config['field_key'] ?? null;
            if (!$fieldKey) continue;

            // Skip if the caller already supplied a value
            if (!empty($customFields[$fieldKey])) continue;

            $tc      = $field->config['type_config'] ?? [];
            $prefix  = $tc['prefix']          ?? '';
            $start   = (int) ($tc['starting_number'] ?? 1);
            $suffix  = $tc['suffix']          ?? '';

            // Use MAX of the numeric suffix stored in the field rather than COUNT(*).
            // COUNT is race-prone (two concurrent stores both count N → both produce N+1).
            // MAX-of-stored-value is idempotent under concurrent reads: both see the same
            // max and both try to write max+1; the second one will then fail a unique check
            // if you add one, or at worst produce a duplicate — still safer than COUNT.
            $jsonPath = '$.' . $fieldKey;

            // Extract the stored numeric portion (strip known prefix/suffix, parse int)
            $maxStored = DB::selectOne(
                "SELECT MAX(CAST(
                    REGEXP_REPLACE(
                        TRIM(BOTH '-' FROM
                            REPLACE(REPLACE(
                                COALESCE(JSON_UNQUOTE(JSON_EXTRACT(`custom_fields`, ?)), ''),
                                ?, ''), ?, '')
                        ),
                    '[^0-9]', '') AS UNSIGNED)) AS mx
                 FROM items
                 WHERE deleted_at IS NULL
                   AND JSON_UNQUOTE(JSON_EXTRACT(`custom_fields`, ?)) IS NOT NULL
                   AND JSON_UNQUOTE(JSON_EXTRACT(`custom_fields`, ?)) != ''",
                [$jsonPath, $prefix, $suffix, $jsonPath, $jsonPath]
            );

            $number = max($start, (int) ($maxStored->mx ?? 0) + 1);
            $padded = str_pad($number, 3, '0', STR_PAD_LEFT);

            $parts = array_values(array_filter([$prefix, $padded, $suffix], fn($p) => $p !== ''));
            $value = implode('-', $parts);
            $customFields[$fieldKey] = $value;
            $preview[$fieldKey]      = $value;
        }

        return $customFields;
    }
}
