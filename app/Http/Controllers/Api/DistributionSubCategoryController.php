<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDistributionSubCategoryRequest;
use App\Http\Requests\UpdateDistributionSubCategoryRequest;
use App\Models\AuditLog;
use App\Models\DistributionSubCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class DistributionSubCategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'DistributionSubCategoryController::index');

        try {
            $categories = DistributionSubCategory::select(
                    'id', 'name', 'distribution_category_id', 'description',
                    'status', 'target_amount', 'cashback_referral',
                    'parent_id', 'level',
                    'linked_location_country_id', 'linked_location_node_id',
                    'portal_access', 'visible_in_hierarchy'
                )
                ->when($request->boolean('trashed'), fn ($q) => $q->onlyTrashed())
                ->with('distributionCategory:id,name', 'parent:id,name', 'linkedCountry:id,name', 'linkedNode:id,name')
                ->orderBy('name')
                ->get();

            return $this->successResponse(['data' => $categories]);

        } catch (Throwable $e) {
            $this->logException('DistributionSubCategoryController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch distribution sub-categories.', 500);
        }
    }

    public function show(Request $request, int $distribution_sub_category): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'DistributionSubCategoryController::show', ['sub_category_id' => $distribution_sub_category]);

        try {
            $record = DistributionSubCategory::select(
                    'id', 'name', 'distribution_category_id', 'description',
                    'status', 'target_amount', 'cashback_referral',
                    'parent_id', 'level',
                    'linked_location_country_id', 'linked_location_node_id',
                    'portal_access', 'visible_in_hierarchy'
                )
                ->with('distributionCategory:id,name', 'parent:id,name', 'linkedCountry:id,name', 'linkedNode:id,name')
                ->findOrFail($distribution_sub_category);

            return $this->successResponse(['data' => $record]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Distribution sub-category not found.', 404);
        } catch (Throwable $e) {
            $this->logException('DistributionSubCategoryController::show', $e, $ctx);
            return $this->errorResponse('Failed to fetch distribution sub-category.', 500);
        }
    }

    public function store(StoreDistributionSubCategoryRequest $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'DistributionSubCategoryController::store');

        try {
            $data = $request->validated();

            if (!empty($data['parent_id'])) {
                $parent = DistributionSubCategory::select('level')->find($data['parent_id']);
                $data['level'] = $parent ? $parent->level + 1 : 1;
            } else {
                $data['level'] = 1;
            }

            $category = DistributionSubCategory::create($data);
            Log::info('[DistributionSubCategoryController] Created', array_merge($ctx, ['sub_category_id' => $category->id]));

            try {
                $this->audit($request, 'created', $category->id, null, $category->toArray());
            } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }

            return $this->successResponse([
                'message' => 'Distribution sub-category created.',
                'data'    => $category->load('distributionCategory:id,name', 'parent:id,name', 'linkedCountry:id,name', 'linkedNode:id,name'),
            ], 201);

        } catch (Throwable $e) {
            $this->logException('DistributionSubCategoryController::store', $e, $ctx);
            return $this->errorResponse('Failed to create distribution sub-category.', 500);
        }
    }

    public function update(UpdateDistributionSubCategoryRequest $request, int $distribution_sub_category): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'DistributionSubCategoryController::update', ['sub_category_id' => $distribution_sub_category]);

        try {
            $record = DistributionSubCategory::findOrFail($distribution_sub_category);
            $old    = $record->toArray();
            $data   = $request->validated();

            if (array_key_exists('parent_id', $data)) {
                if (!empty($data['parent_id'])) {
                    $parent = DistributionSubCategory::select('level')->find($data['parent_id']);
                    $data['level'] = $parent ? $parent->level + 1 : 1;
                } else {
                    $data['level'] = 1;
                }
            }

            $record->update($data);
            Log::info('[DistributionSubCategoryController] Updated', array_merge($ctx, ['sub_category_id' => $distribution_sub_category]));

            try {
                $this->audit($request, 'updated', $distribution_sub_category, $old, $record->fresh()->toArray());
            } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }

            return $this->successResponse([
                'message' => 'Distribution sub-category updated.',
                'data'    => $record->load('distributionCategory:id,name', 'parent:id,name', 'linkedCountry:id,name', 'linkedNode:id,name'),
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Distribution sub-category not found.', 404);
        } catch (Throwable $e) {
            $this->logException('DistributionSubCategoryController::update', $e, $ctx);
            return $this->errorResponse('Failed to update distribution sub-category.', 500);
        }
    }

    public function destroy(Request $request, int $distribution_sub_category): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'DistributionSubCategoryController::destroy', ['sub_category_id' => $distribution_sub_category]);

        try {
            $record = DistributionSubCategory::findOrFail($distribution_sub_category);

            $childCount = DistributionSubCategory::where('parent_id', $distribution_sub_category)->count();
            if ($childCount > 0) {
                return $this->errorResponse(
                    "Cannot delete this sub-category because it has {$childCount} child sub-categor" .
                    ($childCount === 1 ? 'y' : 'ies') . '. Remove or reassign them first.',
                    422
                );
            }

            $snapshot = $record->toArray();
            $record->delete();
            Log::info('[DistributionSubCategoryController] Deleted', $ctx);

            try {
                $this->audit($request, 'deleted', $distribution_sub_category, $snapshot, null);
            } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }

            return $this->successResponse(['message' => 'Distribution sub-category deleted.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Distribution sub-category not found.', 404);
        } catch (Throwable $e) {
            $this->logException('DistributionSubCategoryController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete distribution sub-category.', 500);
        }
    }

    public function restore(Request $request, int $distribution_sub_category): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'DistributionSubCategoryController::restore', ['sub_category_id' => $distribution_sub_category]);

        try {
            $record = DistributionSubCategory::onlyTrashed()->findOrFail($distribution_sub_category);
            $record->restore();
            Log::info('[DistributionSubCategoryController] Restored', array_merge($ctx, ['sub_category_id' => $distribution_sub_category]));

            try {
                $this->audit($request, 'restored', $distribution_sub_category, null, $record->fresh()->toArray());
            } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }

            return $this->successResponse(['message' => 'Distribution sub-category restored.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Deleted distribution sub-category not found.', 404);
        } catch (Throwable $e) {
            $this->logException('DistributionSubCategoryController::restore', $e, $ctx);
            return $this->errorResponse('Failed to restore distribution sub-category.', 500);
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function audit(
        Request $request,
        string  $event,
        int     $categoryId,
        ?array  $oldValues,
        ?array  $newValues
    ): void {
        AuditLog::create([
            'auditable_type' => 'distribution_sub_category',
            'auditable_id'   => $categoryId,
            'event'          => $event,
            'user_id'        => $request->user()->id,
            'ip_address'     => $request->ip(),
            'user_agent'     => $request->userAgent(),
            'old_values'     => $oldValues,
            'new_values'     => $newValues,
        ]);
    }
}
