<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDistributionCategoryRequest;
use App\Http\Requests\UpdateDistributionCategoryRequest;
use App\Models\AuditLog;
use App\Models\DistributionCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class DistributionCategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'DistributionCategoryController::index');

        try {
            $categories = DistributionCategory::select(
                    'id', 'name', 'code', 'description', 'parent_id', 'level',
                    'linked_location_country_id', 'linked_location_node_id', 'linked_location_depth',
                    'portal_access', 'visible_in_hierarchy', 'party_type', 'is_system', 'role_id'
                )
                ->when($request->boolean('trashed'), fn ($q) => $q->onlyTrashed())
                ->with('parent:id,name', 'linkedCountry:id,name', 'linkedNode:id,name', 'role:id,name')
                ->orderBy('name')
                ->get();

            return $this->successResponse(['data' => $categories]);

        } catch (Throwable $e) {
            $this->logException('DistributionCategoryController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch distribution categories.', 500);
        }
    }

    public function show(Request $request, int $distribution_category): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'DistributionCategoryController::show', ['category_id' => $distribution_category]);

        try {
            $record = DistributionCategory::select(
                    'id', 'name', 'code', 'description', 'parent_id', 'level',
                    'linked_location_country_id', 'linked_location_node_id', 'linked_location_depth',
                    'portal_access', 'visible_in_hierarchy', 'party_type', 'is_system', 'role_id'
                )
                ->with('parent:id,name', 'linkedCountry:id,name', 'linkedNode:id,name', 'role:id,name')
                ->findOrFail($distribution_category);

            return $this->successResponse(['data' => $record]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Distribution category not found.', 404);
        } catch (Throwable $e) {
            $this->logException('DistributionCategoryController::show', $e, $ctx);
            return $this->errorResponse('Failed to fetch distribution category.', 500);
        }
    }

    public function store(StoreDistributionCategoryRequest $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'DistributionCategoryController::store');

        try {
            $data = $request->validated();

            if (!empty($data['parent_id'])) {
                $parent = DistributionCategory::select('level')->find($data['parent_id']);
                $data['level'] = $parent ? $parent->level + 1 : 1;
            } else {
                $data['level'] = 1;
            }

            $category = DistributionCategory::create($data);
            Log::info('[DistributionCategoryController] Created', array_merge($ctx, ['category_id' => $category->id]));

            try {
                $this->audit($request, 'created', $category->id, null, $category->toArray());
            } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }

            return $this->successResponse([
                'message' => 'Distribution category created.',
                'data'    => $category->load('parent:id,name', 'linkedCountry:id,name', 'linkedNode:id,name', 'role:id,name'),
            ], 201);

        } catch (Throwable $e) {
            $this->logException('DistributionCategoryController::store', $e, $ctx);
            return $this->errorResponse('Failed to create distribution category.', 500);
        }
    }

    public function update(UpdateDistributionCategoryRequest $request, int $distribution_category): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'DistributionCategoryController::update', ['category_id' => $distribution_category]);

        try {
            $record = DistributionCategory::findOrFail($distribution_category);
            $old    = $record->toArray();
            $data   = $request->validated();

            if (array_key_exists('parent_id', $data)) {
                if (!empty($data['parent_id'])) {
                    $parent = DistributionCategory::select('level')->find($data['parent_id']);
                    $data['level'] = $parent ? $parent->level + 1 : 1;
                } else {
                    $data['level'] = 1;
                }
            }

            $record->update($data);
            Log::info('[DistributionCategoryController] Updated', array_merge($ctx, ['category_id' => $distribution_category]));

            try {
                $this->audit($request, 'updated', $distribution_category, $old, $record->fresh()->toArray());
            } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }

            return $this->successResponse([
                'message' => 'Distribution category updated.',
                'data'    => $record->load('parent:id,name', 'linkedCountry:id,name', 'linkedNode:id,name', 'role:id,name'),
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Distribution category not found.', 404);
        } catch (Throwable $e) {
            $this->logException('DistributionCategoryController::update', $e, $ctx);
            return $this->errorResponse('Failed to update distribution category.', 500);
        }
    }

    public function destroy(Request $request, int $distribution_category): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'DistributionCategoryController::destroy', ['category_id' => $distribution_category]);

        try {
            $record = DistributionCategory::findOrFail($distribution_category);

            $childCount = DistributionCategory::where('parent_id', $distribution_category)->count();
            if ($childCount > 0) {
                return $this->errorResponse(
                    "Cannot delete this category because it has {$childCount} sub-categor" .
                    ($childCount === 1 ? 'y' : 'ies') . '. Remove or reassign them first.',
                    422
                );
            }

            $snapshot = $record->toArray();
            $record->delete();
            Log::info('[DistributionCategoryController] Deleted', $ctx);

            try {
                $this->audit($request, 'deleted', $distribution_category, $snapshot, null);
            } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }

            return $this->successResponse(['message' => 'Distribution category deleted.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Distribution category not found.', 404);
        } catch (Throwable $e) {
            $this->logException('DistributionCategoryController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete distribution category.', 500);
        }
    }

    public function restore(Request $request, int $distribution_category): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'DistributionCategoryController::restore', ['category_id' => $distribution_category]);

        try {
            $record = DistributionCategory::onlyTrashed()->findOrFail($distribution_category);
            $record->restore();
            Log::info('[DistributionCategoryController] Restored', array_merge($ctx, ['category_id' => $distribution_category]));

            try {
                $this->audit($request, 'restored', $distribution_category, null, $record->fresh()->toArray());
            } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }

            return $this->successResponse(['message' => 'Distribution category restored.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Deleted distribution category not found.', 404);
        } catch (Throwable $e) {
            $this->logException('DistributionCategoryController::restore', $e, $ctx);
            return $this->errorResponse('Failed to restore distribution category.', 500);
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
            'auditable_type' => 'distribution_category',
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
