<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHsnCodeRequest;
use App\Http\Requests\UpdateHsnCodeRequest;
use App\Models\HsnCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class HsnCodeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'HsnCodeController::index');

        try {
            $codes = HsnCode::select('id', 'code', 'description')
                ->when($request->boolean('trashed'), fn ($q) => $q->onlyTrashed())
                ->when($request->query('search'),    fn ($q, $v) => $q->where('code', 'like', "%{$v}%"))
                ->orderBy('code')
                ->get();

            return $this->successResponse(['data' => $codes]);

        } catch (Throwable $e) {
            $this->logException('HsnCodeController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch HSN codes.', 500);
        }
    }

    public function store(StoreHsnCodeRequest $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'HsnCodeController::store');

        try {
            $code = HsnCode::create($request->validated());
            Log::info('[HsnCodeController] Created', array_merge($ctx, ['hsn_code_id' => $code->id]));
            return $this->successResponse(['message' => 'HSN code created.', 'data' => $code], 201);

        } catch (Throwable $e) {
            $this->logException('HsnCodeController::store', $e, $ctx);
            return $this->errorResponse('Failed to create HSN code.', 500);
        }
    }

    public function update(UpdateHsnCodeRequest $request, int $hsnCode): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'HsnCodeController::update', ['hsn_code_id' => $hsnCode]);

        try {
            $record = HsnCode::findOrFail($hsnCode);
            $record->update($request->validated());
            Log::info('[HsnCodeController] Updated', $ctx);
            return $this->successResponse(['message' => 'HSN code updated.', 'data' => $record]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('HSN code not found.', 404);
        } catch (Throwable $e) {
            $this->logException('HsnCodeController::update', $e, $ctx);
            return $this->errorResponse('Failed to update HSN code.', 500);
        }
    }

    public function destroy(Request $request, int $hsnCode): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'HsnCodeController::destroy', ['hsn_code_id' => $hsnCode]);

        try {
            HsnCode::findOrFail($hsnCode)->delete();
            Log::info('[HsnCodeController] Deleted', $ctx);
            return $this->successResponse(['message' => 'HSN code deleted.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('HSN code not found.', 404);
        } catch (Throwable $e) {
            $this->logException('HsnCodeController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete HSN code.', 500);
        }
    }

    public function restore(Request $request, int $hsnCode): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'HsnCodeController::restore', ['hsn_code_id' => $hsnCode]);

        try {
            HsnCode::onlyTrashed()->findOrFail($hsnCode)->restore();
            Log::info('[HsnCodeController] Restored', array_merge($ctx, ['hsn_code_id' => $hsnCode]));
            return $this->successResponse(['message' => 'HSN code restored.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Deleted HSN code not found.', 404);
        } catch (Throwable $e) {
            $this->logException('HsnCodeController::restore', $e, $ctx);
            return $this->errorResponse('Failed to restore HSN code.', 500);
        }
    }
}
