<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLocationLayerSchemaRequest;
use App\Models\Country;
use App\Models\DistributionLocationNode;
use App\Models\LocationLayerSchema;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class LocationLayerSchemaController extends Controller
{
    public function index(Request $request, Country $country): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'LocationLayerSchemaController::index');

        try {
            $schemas = $country->layerSchemas()->get(['id', 'country_id', 'depth', 'layer_name', 'parent_node_id']);
            return $this->successResponse(['data' => $schemas]);

        } catch (Throwable $e) {
            $this->logException('LocationLayerSchemaController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch layer schemas.', 500);
        }
    }

    public function store(StoreLocationLayerSchemaRequest $request, Country $country): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'LocationLayerSchemaController::store');

        try {
            $parentNodeId = (int) ($request->validated('parent_node_id') ?? 0);

            $schema = LocationLayerSchema::updateOrCreate(
                ['country_id' => $country->id, 'depth' => $request->validated('depth'), 'parent_node_id' => $parentNodeId],
                ['layer_name' => trim($request->validated('layer_name'))]
            );

            Log::info('[LocationLayerSchemaController] Upserted', array_merge($ctx, ['schema_id' => $schema->id]));
            return $this->successResponse(['message' => 'Layer defined.', 'data' => $schema], 201);

        } catch (Throwable $e) {
            $this->logException('LocationLayerSchemaController::store', $e, $ctx);
            return $this->errorResponse('Failed to define layer.', 500);
        }
    }

    public function destroy(Request $request, Country $country, int $depth): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'LocationLayerSchemaController::destroy');

        try {
            $parentNodeId = $request->has('parent_node_id')
                ? (int) $request->input('parent_node_id')
                : null;

            // Deleting a node-specific override just reverts to global — no node guard needed.
            // Only guard when removing the global schema (parent_node_id = 0 or not scoped).
            $isDeletingGlobal = $parentNodeId === null || $parentNodeId === 0;

            if ($isDeletingGlobal) {
                $nodeCount = DistributionLocationNode::withTrashed()
                    ->where('country_id', $country->id)
                    ->where('depth', $depth)
                    ->count();

                if ($nodeCount > 0) {
                    return $this->errorResponse(
                        "Cannot delete: {$nodeCount} " . ($nodeCount === 1 ? 'node exists' : 'nodes exist') . " at this level. Delete all Level {$depth} nodes first.",
                        422
                    );
                }
            }

            $query = LocationLayerSchema::where('country_id', $country->id)->where('depth', $depth);
            if ($parentNodeId !== null) {
                $query->where('parent_node_id', $parentNodeId);
            }
            $query->delete();

            Log::info('[LocationLayerSchemaController] Deleted depth', array_merge($ctx, ['country_id' => $country->id, 'depth' => $depth, 'parent_node_id' => $parentNodeId]));
            return $this->successResponse(['message' => 'Layer removed.']);

        } catch (Throwable $e) {
            $this->logException('LocationLayerSchemaController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to remove layer.', 500);
        }
    }
}
