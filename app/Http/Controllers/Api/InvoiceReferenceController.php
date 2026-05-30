<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InvoiceReference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class InvoiceReferenceController extends Controller
{
    /**
     * GET /api/invoice-references
     */
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'InvoiceReferenceController::index');
        try {
            $refs = InvoiceReference::orderBy('name')->get();
            return $this->successResponse(['data' => $refs]);
        } catch (Throwable $e) {
            $this->logException('InvoiceReferenceController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch references.', 500);
        }
    }

    /**
     * POST /api/invoice-references
     */
    public function store(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'InvoiceReferenceController::store');
        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        try {
            $ref = InvoiceReference::create($validated);
            return $this->successResponse(['data' => $ref], 201);
        } catch (Throwable $e) {
            $this->logException('InvoiceReferenceController::store', $e, $ctx);
            return $this->errorResponse('Failed to create reference.', 500);
        }
    }

    /**
     * PUT /api/invoice-references/{invoiceReference}
     */
    public function update(Request $request, InvoiceReference $invoiceReference): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'InvoiceReferenceController::update');
        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        try {
            $invoiceReference->update($validated);
            return $this->successResponse(['data' => $invoiceReference]);
        } catch (Throwable $e) {
            $this->logException('InvoiceReferenceController::update', $e, $ctx);
            return $this->errorResponse('Failed to update reference.', 500);
        }
    }

    /**
     * DELETE /api/invoice-references/{invoiceReference}
     */
    public function destroy(Request $request, InvoiceReference $invoiceReference): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'InvoiceReferenceController::destroy');
        try {
            $invoiceReference->delete();
            return $this->successResponse(['message' => 'Reference deleted.']);
        } catch (Throwable $e) {
            $this->logException('InvoiceReferenceController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete reference.', 500);
        }
    }
}
