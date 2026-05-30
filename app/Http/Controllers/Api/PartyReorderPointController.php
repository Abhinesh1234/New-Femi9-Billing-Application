<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\PartyItemReorderPoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class PartyReorderPointController extends Controller
{
    // ── GET /api/party/items/{item}/reorder-point ──────────────────────────────
    public function show(Request $request, int $itemId): JsonResponse
    {
        $partyId = $request->attributes->get('party_scope_id');
        if (!$partyId) {
            return $this->errorResponse('Forbidden.', 403);
        }

        try {
            if (!Item::withTrashed()->where('id', $itemId)->exists()) {
                return $this->errorResponse('Item not found.', 404);
            }

            $row = PartyItemReorderPoint::where('party_id', $partyId)
                ->where('item_id', $itemId)
                ->first();

            return $this->successResponse([
                'data' => $row ? [
                    'reorder_point'    => (float) $row->reorder_point,
                    'last_notified_at' => $row->last_notified_at?->toIso8601String(),
                ] : null,
            ]);
        } catch (Throwable $e) {
            return $this->errorResponse('Failed to fetch reorder point.', 500);
        }
    }

    // ── POST /api/party/items/{item}/reorder-point ─────────────────────────────
    public function upsert(Request $request, int $itemId): JsonResponse
    {
        $partyId = $request->attributes->get('party_scope_id');
        if (!$partyId) {
            return $this->errorResponse('Forbidden.', 403);
        }

        $validated = $request->validate([
            'reorder_point' => ['required', 'numeric', 'min:0'],
        ]);

        try {
            if (!Item::withTrashed()->where('id', $itemId)->exists()) {
                return $this->errorResponse('Item not found.', 404);
            }

            PartyItemReorderPoint::updateOrCreate(
                ['party_id' => $partyId, 'item_id' => $itemId],
                ['reorder_point' => $validated['reorder_point']]
            );

            return $this->successResponse(['message' => 'Reorder point saved.']);
        } catch (Throwable $e) {
            return $this->errorResponse('Failed to save reorder point.', 500);
        }
    }
}
