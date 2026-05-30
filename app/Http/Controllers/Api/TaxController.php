<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tax;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class TaxController extends Controller
{
    /**
     * GET /api/taxes
     */
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'TaxController::index');
        try {
            $taxes = Tax::orderBy('name')->get();
            return $this->successResponse(['data' => $taxes]);
        } catch (Throwable $e) {
            $this->logException('TaxController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch taxes.', 500);
        }
    }

    /**
     * POST /api/taxes
     */
    public function store(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'TaxController::store');
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'rate' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        try {
            $tax = Tax::create($validated);
            return $this->successResponse(['data' => $tax], 201);
        } catch (Throwable $e) {
            $this->logException('TaxController::store', $e, $ctx);
            return $this->errorResponse('Failed to create tax.', 500);
        }
    }

    /**
     * PUT /api/taxes/{tax}
     */
    public function update(Request $request, Tax $tax): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'TaxController::update');
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'rate' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        try {
            $tax->update($validated);
            return $this->successResponse(['data' => $tax]);
        } catch (Throwable $e) {
            $this->logException('TaxController::update', $e, $ctx);
            return $this->errorResponse('Failed to update tax.', 500);
        }
    }

    /**
     * DELETE /api/taxes/{tax}
     */
    public function destroy(Request $request, Tax $tax): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'TaxController::destroy');
        try {
            $tax->delete();
            return $this->successResponse(['message' => 'Tax deleted.']);
        } catch (Throwable $e) {
            $this->logException('TaxController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete tax.', 500);
        }
    }
}
