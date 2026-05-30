<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePartyRequest;
use App\Http\Requests\UpdatePartyRequest;
use App\Http\Traits\EnforcesPartyScope;
use App\Models\AuditLog;
use App\Models\Country;
use App\Models\DistributionCategory;
use App\Models\Invoice;
use App\Models\Location;
use App\Models\Party;
use App\Models\PartyLocation;
use App\Models\Payment;
use App\Services\PartyIdService;
use App\Services\PartySetupService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class PartyController extends Controller
{
    use EnforcesPartyScope;

    // ── GET /api/parties/search ── lightweight autocomplete ──────────────────
    public function search(Request $request): JsonResponse
    {
        $q     = trim((string) ($request->query('q') ?? ''));
        $limit = min(max(1, (int) ($request->query('limit') ?? 20)), 50);

        $results = Party::select(['id', 'display_name', 'first_name', 'last_name', 'company_name', 'party_type', 'mobile', 'distribution_category_id'])
            ->with('distributionCategory:id,name')
            ->where('is_active', true)
            ->when($q !== '', fn ($qb) => $qb->where(fn ($sub) =>
                $sub->where('display_name', 'like', "%{$q}%")
                    ->orWhere('first_name',   'like', "%{$q}%")
                    ->orWhere('last_name',    'like', "%{$q}%")
                    ->orWhere('company_name', 'like', "%{$q}%")
                    ->orWhere('mobile',       'like', "{$q}%")
            ))
            ->orderByRaw("CASE WHEN display_name LIKE ? THEN 0 ELSE 1 END, display_name", ["{$q}%"])
            ->limit($limit)
            ->get();

        return $this->successResponse([
            'data' => $results->map(fn ($p) => [
                'id'          => $p->id,
                'name'        => $p->display_name,
                'mobile'      => $p->mobile,
                'category'    => $p->distributionCategory?->name ?? null,
                'category_id' => $p->distribution_category_id,
            ]),
        ]);
    }

    // ── GET /api/parties ──────────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PartyController::index');

        try {
            $query = Party::select([
                    'id', 'party_id', 'party_type', 'display_name', 'company_name',
                    'first_name', 'last_name', 'email', 'mobile_code', 'mobile',
                    'distribution_category_id', 'distribution_sub_category_id',
                    'parent_party_id',
                    'enable_portal', 'is_active', 'party_image', 'currency', 'payment_terms',
                    'created_by', 'created_at',
                ])
                ->with([
                    'distributionCategory:id,name,code',
                    'distributionSubCategory:id,name',
                    'parent:id,display_name,mobile_code,mobile,distribution_category_id',
                    'parent.distributionCategory:id,name',
                    'createdBy:id,name',
                ])
                // Party users see only sub-parties created under their party
                ->when($this->isPartyUser(), fn ($q) => $q->where('parent_party_id', $this->partyScopeId()))
                ->when($request->query('party_type'), fn ($q, $t) => $q->where('party_type', $t))
                ->when($request->query('distribution_category_id'), fn ($q, $id) => $q->where('distribution_category_id', (int) $id))
                ->when($request->query('creator_type') === 'company', fn ($q) =>
                    $q->where(fn ($sub) =>
                        $sub->whereHas('createdBy', fn ($u) => $u->where('user_type', '!=', 'party'))
                            ->orWhereNull('created_by')
                    )
                )
                ->when($request->query('creator_type') === 'party', fn ($q) =>
                    $q->whereHas('createdBy', fn ($u) => $u->where('user_type', 'party'))
                )
                ->when($request->query('search'), fn ($q, $s) =>
                    $q->where(fn ($sub) =>
                        $sub->where('display_name', 'like', "%{$s}%")
                            ->orWhere('company_name', 'like', "%{$s}%")
                            ->orWhere('email', 'like', "%{$s}%")
                            ->orWhere('party_id', 'like', "%{$s}%")
                            ->orWhereHas('parent', fn ($p) =>
                                $p->where('display_name', 'like', "%{$s}%")
                                  ->orWhere('mobile', 'like', "%{$s}%")
                            )
                            ->orWhereHas('createdBy', fn ($u) =>
                                $u->where('name', 'like', "%{$s}%")
                            )
                    )
                )
                ->when($request->boolean('trashed'), fn ($q) => $q->onlyTrashed());

            $allowedOrderBy = ['display_name', 'created_at'];
            $orderBy  = in_array($request->query('order_by'), $allowedOrderBy, true)
                ? $request->query('order_by') : 'display_name';
            $orderDir = $request->query('order_dir') === 'asc' ? 'asc' : 'desc';
            if ($orderBy === 'display_name') $orderDir = 'asc'; // always asc for name

            $perPage = min(max(1, (int) $request->query('per_page', 50)), 200);
            $result  = $query->orderBy($orderBy, $orderDir)->paginate($perPage);

            return $this->successResponse([
                'data' => $result->items(),
                'meta' => [
                    'current_page' => $result->currentPage(),
                    'last_page'    => $result->lastPage(),
                    'total'        => $result->total(),
                    'per_page'     => $result->perPage(),
                ],
            ]);

        } catch (Throwable $e) {
            $this->logException('PartyController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch parties.', 500);
        }
    }

    // ── POST /api/parties ─────────────────────────────────────────────────────
    public function store(StorePartyRequest $request): JsonResponse
    {
        $this->assertCompanyUser('Party users cannot create new parties.');
        $ctx = $this->buildCtx($request, 'PartyController::store');

        try {
            $data = $request->validated();

            // Resolve category code for party ID generation
            $categoryCode = 'GEN';
            if (!empty($data['distribution_category_id'])) {
                $cat = DistributionCategory::find($data['distribution_category_id']);
                $categoryCode = $cat?->code ?? 'GEN';
            }

            $party = DB::transaction(function () use ($data, $categoryCode, $request) {
                // Circular reference guard: parent_party_id cannot point to self (no ID yet on create, but guard for safety)
                // No circular check needed on create since the party doesn't exist yet.

                // Generate unique party ID atomically
                $data['party_id'] = app(PartyIdService::class)->generate($data['party_type'], $categoryCode);

                // Initialise history map so future type/category changes can restore this ID
                $suffix     = $data['party_type'] === 'business' ? '_B' : '_I';
                $historyKey = strtoupper($categoryCode) . $suffix;
                $data['party_id_history'] = [$historyKey => $data['party_id']];

                $data['created_by'] = $request->user()->id;
                $data['updated_by'] = $request->user()->id;

                // Pull out relation data before Party::create
                $billingAddress  = $data['billing_address']   ?? null;
                $shippingAddress = $data['shipping_address']  ?? null;
                $locationNodeIds = $data['location_node_ids'] ?? [];

                unset($data['billing_address'], $data['shipping_address'], $data['location_node_ids']);

                $party = Party::create($data);

                // Persist addresses (only if at least one non-null field is present)
                if ($billingAddress && count(array_filter($billingAddress)) > 0) {
                    $party->addresses()->create(array_merge(
                        $this->resolveAddress($billingAddress),
                        ['address_type' => 'billing']
                    ));
                }

                if ($shippingAddress && count(array_filter($shippingAddress)) > 0) {
                    $party->addresses()->create(array_merge(
                        $this->resolveAddress($shippingAddress),
                        ['address_type' => 'shipping']
                    ));
                }

                // Persist location associations
                foreach (array_unique((array) $locationNodeIds) as $nodeId) {
                    PartyLocation::create([
                        'party_id'        => $party->id,
                        'location_node_id' => (int) $nodeId,
                        'created_at'      => now(),
                    ]);
                }

                // Auto-create stock locations and portal user
                $setup = app(PartySetupService::class);
                $setup->createStockLocations($party, $locationNodeIds, $data['created_by']);
                $setup->createPortalUser($party, $data['created_by']);

                return $party;
            });

            Log::info('[PartyController] Created', array_merge($ctx, ['party_id' => $party->party_id]));

            try {
                $this->audit($request, 'created', $party->id, null, $party->toArray());
            } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }

            return $this->successResponse([
                'message' => 'Party created successfully.',
                'data'    => $party->load([
                    'billingAddress', 'shippingAddress', 'locations',
                    'distributionCategory:id,name,code',
                    'distributionSubCategory:id,name',
                    'parent:id,display_name,party_type',
                    'role:id,name',
                ]),
            ], 201);

        } catch (Throwable $e) {
            $this->logException('PartyController::store', $e, $ctx);
            return $this->errorResponse('Failed to create party.', 500);
        }
    }

    // ── GET /api/parties/{id} ─────────────────────────────────────────────────
    public function show(Request $request, int $id): JsonResponse
    {
        // Party users can only view their own party profile
        if ($this->isPartyUser() && $id !== $this->partyScopeId()) {
            return $this->errorResponse('Access denied.', 403);
        }
        $ctx = $this->buildCtx($request, 'PartyController::show');

        try {
            $party = Party::withTrashed()
                ->with([
                    'billingAddress.country:id,name',
                    'shippingAddress.country:id,name',
                    'locations.locationNode:id,name',
                    'distributionCategory:id,name,code',
                    'distributionSubCategory:id,name',
                    'parent:id,display_name,party_type',
                    'createdBy:id,name',
                    'role:id,name',
                ])
                ->findOrFail($id);

            return $this->successResponse(['data' => $party]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Party not found.', 404);
        } catch (Throwable $e) {
            $this->logException('PartyController::show', $e, $ctx);
            return $this->errorResponse('Failed to fetch party.', 500);
        }
    }

    // ── GET /api/parties/check-display-name ──────────────────────────────────
    public function checkDisplayName(Request $request): JsonResponse
    {
        $name      = mb_strtolower(trim($request->query('name', '')));
        $excludeId = $request->query('exclude_id');

        if ($name === '') {
            return $this->successResponse(['exists' => false]);
        }

        $exists = Party::whereRaw('LOWER(TRIM(display_name)) = ?', [$name])
            ->whereNull('deleted_at')
            ->when($excludeId, fn ($q) => $q->where('id', '!=', (int) $excludeId))
            ->exists();

        return $this->successResponse(['exists' => $exists]);
    }

    // ── GET /api/parties/taken-locations ─────────────────────────────────────
    public function takenLocations(Request $request): JsonResponse
    {
        $request->validate(['distribution_category_id' => 'required|integer|exists:distribution_categories,id']);

        $ids = DB::table('party_locations as pl')
            ->join('parties as p', 'p.id', '=', 'pl.party_id')
            ->whereNull('p.deleted_at')
            ->where('p.distribution_category_id', (int) $request->query('distribution_category_id'))
            ->pluck('pl.location_node_id')
            ->map(fn($id) => (int) $id)
            ->values()
            ->all();

        return $this->successResponse(['data' => $ids]);
    }

    // ── GET /api/parties/preview-id ───────────────────────────────────────────
    public function previewId(Request $request): JsonResponse
    {
        $request->validate([
            'party_type'    => 'required|in:business,individual',
            'category_code' => 'nullable|string|max:50',
        ]);

        $preview = app(PartyIdService::class)->preview(
            $request->query('party_type'),
            $request->query('category_code', 'GEN')
        );

        return $this->successResponse(['party_id' => $preview]);
    }

    // ── PUT /api/parties/{id} ─────────────────────────────────────────────────
    public function update(UpdatePartyRequest $request, int $id): JsonResponse
    {
        // Party users can only update their own party profile
        if ($this->isPartyUser() && $id !== $this->partyScopeId()) {
            return $this->errorResponse('Access denied.', 403);
        }
        $ctx = $this->buildCtx($request, 'PartyController::update');

        try {
            $party = Party::findOrFail($id);
            $old   = $party->toArray();
            $data  = $request->validated();
            $data['updated_by'] = $request->user()->id;

            // Guard against circular hierarchy: parent cannot be self or a descendant
            if (!empty($data['parent_party_id'])) {
                $newParentId = (int) $data['parent_party_id'];
                if ($newParentId === $id) {
                    return $this->errorResponse('A party cannot be its own parent.', 422);
                }
                $descendantIds = $party->descendantIds();
                if (in_array($newParentId, $descendantIds, true)) {
                    return $this->errorResponse('Cannot set a descendant party as the parent (circular hierarchy).', 422);
                }
            }

            // Determine new type and category after this update
            $newType       = $data['party_type'] ?? $party->party_type;
            $newCategoryId = array_key_exists('distribution_category_id', $data)
                ? $data['distribution_category_id']
                : $party->distribution_category_id;

            // Resolve category codes (current and new)
            $oldCategoryCode = $party->distributionCategory?->code ?? 'GEN';
            $newCategoryCode = 'GEN';
            if ($newCategoryId) {
                $newCat = DistributionCategory::find($newCategoryId);
                $newCategoryCode = $newCat?->code ?? 'GEN';
            }

            $oldSuffix  = $party->party_type === 'business' ? '_B' : '_I';
            $newSuffix  = $newType === 'business' ? '_B' : '_I';
            $currentKey = strtoupper($oldCategoryCode) . $oldSuffix;
            $newKey     = strtoupper($newCategoryCode) . $newSuffix;

            // If the type+category combination changed, restore or generate a party ID
            if ($currentKey !== $newKey) {
                $history = $party->party_id_history ?? [];

                // Save the current party_id into the history map
                $history[$currentKey] = $party->party_id;

                // Restore a previous ID for this combination, or generate a new one
                $data['party_id'] = isset($history[$newKey])
                    ? $history[$newKey]
                    : app(PartyIdService::class)->generate($newType, $newCategoryCode);

                $data['party_id_history'] = $history;
            }

            // Switching to individual: clear business-specific fields (keep distribution_category_id — individual parties have their own)
            if ($newType === 'individual' && $party->party_type !== 'individual') {
                $data['distribution_sub_category_id'] = null;
                $data['location_node_ids']            = [];
            }

            DB::transaction(function () use ($party, $data) {
                $billingAddress  = $data['billing_address']   ?? null;
                $shippingAddress = $data['shipping_address']  ?? null;
                $locationNodeIds = $data['location_node_ids'] ?? null;

                unset($data['billing_address'], $data['shipping_address'], $data['location_node_ids']);

                $party->update($data);

                // Sync stock locations and portal user
                $party->refresh();
                $setup = app(PartySetupService::class);
                $setup->syncStockLocations($party, $locationNodeIds, $data['updated_by']);
                $setup->syncPortalUser($party);

                // Upsert billing address
                if ($billingAddress !== null) {
                    if (count(array_filter($billingAddress)) > 0) {
                        $party->addresses()->updateOrCreate(
                            ['address_type' => 'billing'],
                            $this->resolveAddress($billingAddress)
                        );
                    } else {
                        $party->addresses()->where('address_type', 'billing')->delete();
                    }
                }

                // Upsert shipping address
                if ($shippingAddress !== null) {
                    if (count(array_filter($shippingAddress)) > 0) {
                        $party->addresses()->updateOrCreate(
                            ['address_type' => 'shipping'],
                            $this->resolveAddress($shippingAddress)
                        );
                    } else {
                        $party->addresses()->where('address_type', 'shipping')->delete();
                    }
                }

                // Sync locations
                if ($locationNodeIds !== null) {
                    $party->locations()->delete();
                    foreach (array_unique((array) $locationNodeIds) as $nodeId) {
                        PartyLocation::create([
                            'party_id'         => $party->id,
                            'location_node_id' => (int) $nodeId,
                            'created_at'       => now(),
                        ]);
                    }
                }
            });

            Log::info('[PartyController] Updated', array_merge($ctx, ['party_id' => $party->party_id]));

            try {
                $this->audit($request, 'updated', $id, $old, $party->fresh()->toArray());
            } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }

            return $this->successResponse([
                'message' => 'Party updated.',
                'data'    => $party->fresh([
                    'billingAddress', 'shippingAddress', 'locations',
                    'distributionCategory:id,name,code',
                    'distributionSubCategory:id,name',
                    'parent:id,display_name,party_type',
                    'role:id,name',
                ]),
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Party not found.', 404);
        } catch (Throwable $e) {
            $this->logException('PartyController::update', $e, $ctx);
            return $this->errorResponse('Failed to update party.', 500);
        }
    }

    // ── POST /api/parties/{id}/toggle-status ─────────────────────────────────
    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PartyController::toggleStatus');

        try {
            $party = Party::findOrFail($id);
            $old = $party->toArray();
            $party->is_active = !$party->is_active;
            $party->save();

            // Keep linked stock location in sync with party active state
            Location::where('party_id', $id)->update(['is_active' => $party->is_active]);

            try {
                $this->audit($request, 'updated', $id, $old, $party->toArray());
            } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }

            return $this->successResponse([
                'message'   => $party->is_active ? 'Party activated.' : 'Party deactivated.',
                'is_active' => $party->is_active,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Party not found.', 404);
        } catch (Throwable $e) {
            $this->logException('PartyController::toggleStatus', $e, $ctx);
            return $this->errorResponse('Failed to update party status.', 500);
        }
    }

    // ── DELETE /api/parties/{id} ──────────────────────────────────────────────
    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->assertCompanyUser('Party users cannot delete party accounts.');
        $ctx = $this->buildCtx($request, 'PartyController::destroy');

        try {
            $party = Party::findOrFail($id);

            // Block deletion if customer has an unused advance payment balance
            $advanceBalance = \App\Models\Payment::where('customer_id', $id)
                ->where('payment_mode', 'advance_payment')
                ->whereNull('deleted_at')
                ->where('unused_amount', '>', 0)
                ->sum('unused_amount');

            if ($advanceBalance > 0.005) {
                return $this->errorResponse(
                    'Cannot delete this customer. They have an advance payment balance of ₹' .
                    number_format((float) $advanceBalance, 2) .
                    '. Please refund or apply the advance balance before deleting.',
                    422
                );
            }

            try {
                $this->audit($request, 'deleted', $id, $party->toArray(), null);
            } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }

            $party->delete();

            // Deactivate linked stock location so buyer side is skipped in stock movements
            Location::where('party_id', $id)->update(['is_active' => false]);

            Log::info('[PartyController] Deleted', array_merge($ctx, ['party_id' => $party->party_id]));
            return $this->successResponse(['message' => 'Party deleted.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Party not found.', 404);
        } catch (Throwable $e) {
            $this->logException('PartyController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete party.', 500);
        }
    }

    // ── POST /api/parties/{id}/restore ────────────────────────────────────────
    public function restore(Request $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PartyController::restore');

        try {
            $party = Party::onlyTrashed()->findOrFail($id);
            $party->restore();

            // Reactivate linked stock location so buyer side resumes in stock movements
            Location::where('party_id', $id)->update(['is_active' => true]);

            try {
                $this->audit($request, 'restored', $id, null, $party->fresh()->toArray());
            } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }

            return $this->successResponse(['message' => 'Party restored.', 'data' => $party->fresh()]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Deleted party not found.', 404);
        } catch (Throwable $e) {
            $this->logException('PartyController::restore', $e, $ctx);
            return $this->errorResponse('Failed to restore party.', 500);
        }
    }

    // ── POST /api/parties/upload-image ────────────────────────────────────────
    // Frontend already compresses to JPEG (canvas 1200px / 85%). We just store it.
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|file|mimes:jpeg,jpg|max:2048',
        ]);

        $ctx = $this->buildCtx($request, 'PartyController::uploadImage');

        try {
            $filename = 'parties/images/' . \Illuminate\Support\Str::uuid() . '.jpg';
            \Illuminate\Support\Facades\Storage::disk('public')->put(
                $filename,
                file_get_contents($request->file('image')->getRealPath())
            );
            return $this->successResponse([
                'path' => $filename,
                'url'  => \Illuminate\Support\Facades\Storage::disk('public')->url($filename),
            ], 201);

        } catch (Throwable $e) {
            $this->logException('PartyController::uploadImage', $e, $ctx);
            return $this->errorResponse('Failed to upload image.', 500);
        }
    }

    // ── POST /api/parties/upload-document ─────────────────────────────────────
    // Images → GD 85% JPEG  |  PDFs → Ghostscript ebook  |  Office → Zip level 9
    public function uploadDocument(Request $request): JsonResponse
    {
        $request->validate([
            'document' => 'required|file|max:10240|mimetypes:image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,text/plain,application/rtf',
        ]);

        $ctx = $this->buildCtx($request, 'PartyController::uploadDocument');

        try {
            $file = $request->file('document');
            $mime = $file->getMimeType();
            $ext  = strtolower($file->getClientOriginalExtension());
            $uuid = \Illuminate\Support\Str::uuid();

            // ── Images: compress to 85 % JPEG via GD ─────────────────────────
            $imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (in_array($mime, $imageTypes, true) && function_exists('imagecreatefromstring')) {
                $src = imagecreatefromstring(file_get_contents($file->getRealPath()));
                if ($src !== false) {
                    $tmp = tempnam(sys_get_temp_dir(), 'party_doc_img_');
                    imagejpeg($src, $tmp, 85);
                    imagedestroy($src);
                    $filename = "parties/documents/{$uuid}.jpg";
                    \Illuminate\Support\Facades\Storage::disk('public')->put($filename, file_get_contents($tmp));
                    @unlink($tmp);
                    return $this->successResponse([
                        'path'      => $filename,
                        'url'       => \Illuminate\Support\Facades\Storage::disk('public')->url($filename),
                        'file_name' => $file->getClientOriginalName(),
                        'file_size' => \Illuminate\Support\Facades\Storage::disk('public')->size($filename),
                        'mime_type' => 'image/jpeg',
                    ], 201);
                }
            }

            // ── PDFs: Ghostscript ebook compression ───────────────────────────
            if ($mime === 'application/pdf') {
                $filename = "parties/documents/{$uuid}.pdf";
                $tmpOut   = $this->ghostscriptCompressPdf($file->getRealPath());
                $src      = ($tmpOut !== null && filesize($tmpOut) < filesize($file->getRealPath()))
                    ? $tmpOut : $file->getRealPath();
                \Illuminate\Support\Facades\Storage::disk('public')->put($filename, file_get_contents($src));
                if ($tmpOut !== null) @unlink($tmpOut);
                return $this->successResponse([
                    'path'      => $filename,
                    'url'       => \Illuminate\Support\Facades\Storage::disk('public')->url($filename),
                    'file_name' => $file->getClientOriginalName(),
                    'file_size' => \Illuminate\Support\Facades\Storage::disk('public')->size($filename),
                    'mime_type' => 'application/pdf',
                ], 201);
            }

            // ── Office docs: re-compress ZIP at max deflate ───────────────────
            $zipMimes = [
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            ];
            if (in_array($mime, $zipMimes, true)) {
                $filename = "parties/documents/{$uuid}.{$ext}";
                $tmpOut   = $this->recompressZipFile($file->getRealPath(), $ext);
                $src      = ($tmpOut !== null && filesize($tmpOut) < filesize($file->getRealPath()))
                    ? $tmpOut : $file->getRealPath();
                \Illuminate\Support\Facades\Storage::disk('public')->put($filename, file_get_contents($src));
                if ($tmpOut !== null) @unlink($tmpOut);
                return $this->successResponse([
                    'path'      => $filename,
                    'url'       => \Illuminate\Support\Facades\Storage::disk('public')->url($filename),
                    'file_name' => $file->getClientOriginalName(),
                    'file_size' => \Illuminate\Support\Facades\Storage::disk('public')->size($filename),
                    'mime_type' => $mime,
                ], 201);
            }

            // ── All other files: store as-is ──────────────────────────────────
            $filename = "parties/documents/{$uuid}.{$ext}";
            \Illuminate\Support\Facades\Storage::disk('public')->put($filename, file_get_contents($file->getRealPath()));
            return $this->successResponse([
                'path'      => $filename,
                'url'       => \Illuminate\Support\Facades\Storage::disk('public')->url($filename),
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $mime,
            ], 201);

        } catch (Throwable $e) {
            $this->logException('PartyController::uploadDocument', $e, $ctx);
            return $this->errorResponse('Failed to upload document.', 500);
        }
    }

    // ── GET /api/parties/{id}/children ───────────────────────────────────────
    public function children(Request $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PartyController::children', ['party_id' => $id]);
        try {
            if (!Party::where('id', $id)->exists()) {
                return $this->errorResponse('Party not found.', 404);
            }

            $children = Party::select([
                    'id', 'party_id', 'party_type', 'display_name', 'company_name',
                    'mobile', 'is_active', 'distribution_category_id', 'parent_party_id',
                ])
                ->with('distributionCategory:id,name,code')
                ->where('parent_party_id', $id)
                ->orderBy('display_name')
                ->get();

            return $this->successResponse(['data' => $children]);

        } catch (Throwable $e) {
            $this->logException('PartyController::children', $e, $ctx);
            return $this->errorResponse('Failed to fetch children.', 500);
        }
    }

    // ── GET /api/parties/{id}/receivables ────────────────────────────────────
    public function receivables(Request $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'PartyController::receivables', ['party_id' => $id]);
        try {
            if (!Party::withTrashed()->where('id', $id)->exists()) {
                return $this->errorResponse('Party not found.', 404);
            }

            // Outstanding receivables = sum of balance_amount on non-draft, non-paid,
            // non-void, non-trashed invoices that still carry an unpaid balance.
            $outstanding = (float) Invoice::where('customer_id', $id)
                ->whereNull('deleted_at')
                ->whereNotIn('status', ['draft', 'paid', 'void'])
                ->where('balance_amount', '>', 0)
                ->sum('balance_amount');

            // Unused credits = advance-payment balance that hasn't been applied yet.
            $unusedCredits = (float) Payment::where('customer_id', $id)
                ->where('payment_mode', 'advance_payment')
                ->where('status', 'open')
                ->whereNull('deleted_at')
                ->sum('unused_amount');

            return $this->successResponse([
                'data' => [
                    'outstanding_receivables' => round($outstanding,    2),
                    'unused_credits'          => round($unusedCredits, 2),
                ],
            ]);
        } catch (Throwable $e) {
            $this->logException('PartyController::receivables', $e, $ctx);
            return $this->errorResponse('Failed to fetch receivables.', 500);
        }
    }

    private function ghostscriptCompressPdf(string $inputPath): ?string
    {
        if (!function_exists('exec')) return null;
        exec('which gs 2>/dev/null', $out, $code);
        if ($code !== 0 || empty($out)) return null;
        $gs  = trim($out[0]);
        $tmp = tempnam(sys_get_temp_dir(), 'party_pdf_') . '.pdf';
        $cmd = sprintf(
            '%s -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=%s %s 2>/dev/null',
            escapeshellarg($gs), escapeshellarg($tmp), escapeshellarg($inputPath)
        );
        exec($cmd, $cmdOut, $exitCode);
        if ($exitCode !== 0 || !file_exists($tmp) || filesize($tmp) === 0) { @unlink($tmp); return null; }
        return $tmp;
    }

    private function recompressZipFile(string $inputPath, string $ext): ?string
    {
        if (!class_exists('ZipArchive')) return null;
        $inZip = new \ZipArchive();
        if ($inZip->open($inputPath) !== true) return null;
        $tmp   = tempnam(sys_get_temp_dir(), 'party_zip_') . '.' . $ext;
        $outZip = new \ZipArchive();
        if ($outZip->open($tmp, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) { $inZip->close(); return null; }
        for ($i = 0; $i < $inZip->numFiles; $i++) {
            $name    = $inZip->getNameIndex($i);
            $content = $inZip->getFromIndex($i);
            $outZip->addFromString($name, $content);
            $outZip->setCompressionName($name, \ZipArchive::CM_DEFLATE, 9);
        }
        $inZip->close();
        $outZip->close();
        return $tmp;
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function resolveAddress(array $address): array
    {
        $countryId = null;
        if (!empty($address['country'])) {
            $countryId = Country::where('name', $address['country'])->value('id');
        }

        return [
            'attention'  => $address['attention']  ?? null,
            'country_id' => $countryId,
            'street1'    => $address['street1']    ?? null,
            'street2'    => $address['street2']    ?? null,
            'city'       => $address['city']       ?? null,
            'state'      => $address['state']      ?? null,
            'pin_code'   => $address['pin_code']   ?? null,
            'phone_code' => $address['phone_code'] ?? null,
            'phone'      => $address['phone']      ?? null,
            'fax'        => $address['fax']        ?? null,
        ];
    }

    private function audit(
        Request $request,
        string  $event,
        int     $partyId,
        ?array  $oldValues,
        ?array  $newValues
    ): void {
        AuditLog::create([
            'auditable_type' => 'party',
            'auditable_id'   => $partyId,
            'event'          => $event,
            'user_id'        => $request->user()->id,
            'ip_address'     => $request->ip(),
            'user_agent'     => $request->userAgent(),
            'old_values'     => $oldValues,
            'new_values'     => $newValues,
        ]);
    }
}
