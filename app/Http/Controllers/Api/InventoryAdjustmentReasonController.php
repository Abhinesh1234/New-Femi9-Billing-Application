<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryAdjustmentReason;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class InventoryAdjustmentReasonController extends Controller
{
    // ── GET /api/inventory/adjustment-reasons ─────────────────────────────────
    public function index(): JsonResponse
    {
        $reasons = InventoryAdjustmentReason::orderBy('sort_order')->orderBy('name')->get();
        return $this->successResponse(['data' => $reasons]);
    }

    // ── POST /api/inventory/adjustment-reasons ────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:inventory_adjustment_reasons,name',
        ]);

        try {
            $maxOrder = InventoryAdjustmentReason::max('sort_order') ?? 0;
            $reason   = InventoryAdjustmentReason::create([
                'name'       => trim($validated['name']),
                'sort_order' => $maxOrder + 1,
                'created_by' => $request->user()?->id,
            ]);
            return $this->successResponse(['data' => $reason], 201);
        } catch (Throwable $e) {
            return $this->errorResponse('Failed to create reason.', 500);
        }
    }

    // ── PUT /api/inventory/adjustment-reasons/{id} ────────────────────────────
    public function update(Request $request, int $id): JsonResponse
    {
        $reason = InventoryAdjustmentReason::findOrFail($id);

        $validated = $request->validate([
            'name' => "required|string|max:255|unique:inventory_adjustment_reasons,name,{$id}",
        ]);

        try {
            $reason->update(['name' => trim($validated['name'])]);
            return $this->successResponse(['data' => $reason]);
        } catch (Throwable $e) {
            return $this->errorResponse('Failed to update reason.', 500);
        }
    }

    // ── DELETE /api/inventory/adjustment-reasons/{id} ─────────────────────────
    public function destroy(int $id): JsonResponse
    {
        try {
            $reason = InventoryAdjustmentReason::findOrFail($id);
            $reason->delete();
            return $this->successResponse(['message' => 'Reason deleted.']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Reason not found.', 404);
        } catch (Throwable $e) {
            return $this->errorResponse('Failed to delete reason.', 500);
        }
    }
}
