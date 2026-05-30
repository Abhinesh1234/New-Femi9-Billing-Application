<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDistributionLocationNodeRequest;
use App\Http\Requests\UpdateDistributionLocationNodeRequest;
use App\Models\DistributionLocationNode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class DistributionLocationNodeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'DistributionLocationNodeController::index');

        try {
            $countryId = $request->integer('country_id') ?: null;
            $trashed   = $request->boolean('trashed');

            // parent_id: empty string or absent → filter by NULL; integer string → filter by that ID
            $rawParentId = $request->input('parent_id');
            $hasParentFilter = $request->has('parent_id');
            $parentId = ($rawParentId !== null && $rawParentId !== '') ? (int) $rawParentId : null;

            $query = DistributionLocationNode::query()
                ->when($trashed, fn ($q) => $q->onlyTrashed())
                ->when($countryId, fn ($q, $cid) => $q->where('country_id', $cid))
                ->when($hasParentFilter, fn ($q) => $q->where('parent_id', $parentId))
                ->when($request->input('search'), fn ($q, $s) => $q->search($s))
                ->withCount('children')
                ->orderBy('name');

            return $this->successResponse(['data' => $query->get()]);

        } catch (Throwable $e) {
            $this->logException('DistributionLocationNodeController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch nodes.', 500);
        }
    }

    public function store(StoreDistributionLocationNodeRequest $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'DistributionLocationNodeController::store');

        try {
            $node = DistributionLocationNode::create([
                'country_id' => $request->validated('country_id'),
                'parent_id'  => $request->validated('parent_id'),
                'depth'      => $request->validated('depth'),
                'name'       => trim($request->validated('name')),
                'code'       => $request->validated('code') ? trim($request->validated('code')) : null,
                'is_active'  => $request->validated('is_active', true),
                'created_by' => $request->user()?->id,
            ]);

            Log::info('[DistributionLocationNodeController] Created', array_merge($ctx, ['node_id' => $node->id]));
            return $this->successResponse(['message' => 'Location created.', 'data' => $node->loadCount('children')], 201);

        } catch (Throwable $e) {
            $this->logException('DistributionLocationNodeController::store', $e, $ctx);
            return $this->errorResponse('Failed to create location.', 500);
        }
    }

    public function update(UpdateDistributionLocationNodeRequest $request, DistributionLocationNode $distributionLocationNode): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'DistributionLocationNodeController::update');

        try {
            $distributionLocationNode->update([
                'name'      => trim($request->validated('name')),
                'code'      => $request->validated('code') ? trim($request->validated('code')) : null,
                'is_active' => $request->validated('is_active', $distributionLocationNode->is_active),
            ]);

            Log::info('[DistributionLocationNodeController] Updated', array_merge($ctx, ['node_id' => $distributionLocationNode->id]));
            return $this->successResponse([
                'message' => 'Location updated.',
                'data'    => $distributionLocationNode->fresh()->loadCount('children'),
            ]);

        } catch (Throwable $e) {
            $this->logException('DistributionLocationNodeController::update', $e, $ctx);
            return $this->errorResponse('Failed to update location.', 500);
        }
    }

    public function destroy(Request $request, DistributionLocationNode $distributionLocationNode): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'DistributionLocationNodeController::destroy');

        try {
            if ($distributionLocationNode->children()->count() > 0) {
                return $this->errorResponse(
                    'Cannot delete: this location has sub-locations. Delete or move them first.',
                    422
                );
            }

            $distributionLocationNode->delete();
            Log::info('[DistributionLocationNodeController] Deleted', array_merge($ctx, ['node_id' => $distributionLocationNode->id]));
            return $this->successResponse(['message' => 'Location deleted.']);

        } catch (Throwable $e) {
            $this->logException('DistributionLocationNodeController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete location.', 500);
        }
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'DistributionLocationNodeController::bulkDestroy');

        try {
            $request->validate([
                'ids'   => ['required', 'array', 'min:1', 'max:500'],
                'ids.*' => ['integer'],
            ]);

            $ids = array_map('intval', $request->input('ids'));

            // Guard: block if any selected node has active children
            $blockedCount = DistributionLocationNode::whereIn('parent_id', $ids)
                ->whereNull('deleted_at')
                ->distinct()
                ->count('parent_id');

            if ($blockedCount > 0) {
                return $this->errorResponse(
                    "{$blockedCount} selected location(s) still have sub-locations. Delete their sub-locations first.",
                    422
                );
            }

            $deleted = 0;
            DB::transaction(function () use ($ids, &$deleted) {
                $deleted = DistributionLocationNode::whereIn('id', $ids)->delete();
            });

            Log::info('[DistributionLocationNodeController] Bulk deleted', array_merge($ctx, ['ids' => $ids, 'count' => $deleted]));
            return $this->successResponse(['message' => "{$deleted} location" . ($deleted === 1 ? '' : 's') . " deleted."]);

        } catch (Throwable $e) {
            $this->logException('DistributionLocationNodeController::bulkDestroy', $e, $ctx);
            return $this->errorResponse('Failed to bulk delete locations.', 500);
        }
    }

    public function bulkRestore(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'DistributionLocationNodeController::bulkRestore');

        try {
            $request->validate([
                'ids'   => ['required', 'array', 'min:1', 'max:500'],
                'ids.*' => ['integer'],
            ]);

            $ids = array_map('intval', $request->input('ids'));

            $count = 0;
            DB::transaction(function () use ($ids, &$count) {
                $count = DistributionLocationNode::withTrashed()->whereIn('id', $ids)->restore();
            });

            Log::info('[DistributionLocationNodeController] Bulk restored', array_merge($ctx, ['ids' => $ids, 'count' => $count]));
            return $this->successResponse(['message' => "{$count} location" . ($count === 1 ? '' : 's') . " restored."]);

        } catch (Throwable $e) {
            $this->logException('DistributionLocationNodeController::bulkRestore', $e, $ctx);
            return $this->errorResponse('Failed to bulk restore locations.', 500);
        }
    }

    public function restore(Request $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'DistributionLocationNodeController::restore');

        try {
            $node = DistributionLocationNode::withTrashed()->findOrFail($id);

            if (!$node->trashed()) {
                return $this->errorResponse('Location is not deleted.', 422);
            }

            $node->restore();

            Log::info('[DistributionLocationNodeController] Restored', array_merge($ctx, ['node_id' => $node->id]));
            return $this->successResponse(['message' => 'Location restored.', 'data' => $node->fresh()->loadCount('children')]);

        } catch (Throwable $e) {
            $this->logException('DistributionLocationNodeController::restore', $e, $ctx);
            return $this->errorResponse('Failed to restore location.', 500);
        }
    }

    public function ancestors(Request $request, DistributionLocationNode $distributionLocationNode): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'DistributionLocationNodeController::ancestors');

        try {
            $cols      = ['id', 'parent_id', 'country_id', 'depth', 'name', 'code', 'is_active', 'created_at'];
            $ancestors = [];
            $current   = $distributionLocationNode;

            // Walk parent chain with one targeted query per level (max ~5 queries for realistic hierarchies)
            // This replaces a full-country table scan with bounded targeted lookups
            while ($current->parent_id !== null) {
                $parent = DistributionLocationNode::select($cols)->find($current->parent_id);
                if (!$parent) break;
                array_unshift($ancestors, $parent);
                $current = $parent;
            }

            return $this->successResponse([
                'data' => [
                    'country'   => $distributionLocationNode->country,
                    'ancestors' => array_values($ancestors),
                    'current'   => $distributionLocationNode->loadCount('children'),
                ],
            ]);

        } catch (Throwable $e) {
            $this->logException('DistributionLocationNodeController::ancestors', $e, $ctx);
            return $this->errorResponse('Failed to fetch ancestors.', 500);
        }
    }
}
