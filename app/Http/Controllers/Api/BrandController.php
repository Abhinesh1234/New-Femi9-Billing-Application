<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBrandRequest;
use App\Http\Requests\UpdateBrandRequest;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class BrandController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'BrandController::index');

        try {
            $brands = Brand::select('id', 'name')
                ->when($request->boolean('trashed'), fn ($q) => $q->onlyTrashed())
                ->orderBy('name')
                ->get();

            return $this->successResponse(['data' => $brands]);

        } catch (Throwable $e) {
            $this->logException('BrandController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch brands.', 500);
        }
    }

    public function store(StoreBrandRequest $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'BrandController::store');

        try {
            $brand = Brand::create(['name' => trim($request->validated('name'))]);
            Log::info('[BrandController] Created', array_merge($ctx, ['brand_id' => $brand->id]));
            return $this->successResponse(['message' => 'Brand created.', 'data' => $brand], 201);

        } catch (Throwable $e) {
            $this->logException('BrandController::store', $e, $ctx);
            return $this->errorResponse('Failed to create brand.', 500);
        }
    }

    public function update(UpdateBrandRequest $request, int $brand): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'BrandController::update', ['brand_id' => $brand]);

        try {
            $record = Brand::findOrFail($brand);
            $record->update(['name' => trim($request->validated('name'))]);
            Log::info('[BrandController] Updated', array_merge($ctx, ['brand_id' => $brand]));
            return $this->successResponse(['message' => 'Brand updated.', 'data' => $record]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Brand not found.', 404);
        } catch (Throwable $e) {
            $this->logException('BrandController::update', $e, $ctx);
            return $this->errorResponse('Failed to update brand.', 500);
        }
    }

    public function destroy(Request $request, int $brand): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'BrandController::destroy', ['brand_id' => $brand]);

        try {
            Brand::findOrFail($brand)->delete();
            Log::info('[BrandController] Deleted', $ctx);
            return $this->successResponse(['message' => 'Brand deleted.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Brand not found.', 404);
        } catch (Throwable $e) {
            $this->logException('BrandController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete brand.', 500);
        }
    }

    public function restore(Request $request, int $brand): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'BrandController::restore', ['brand_id' => $brand]);

        try {
            Brand::onlyTrashed()->findOrFail($brand)->restore();
            Log::info('[BrandController] Restored', array_merge($ctx, ['brand_id' => $brand]));
            return $this->successResponse(['message' => 'Brand restored.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Deleted brand not found.', 404);
        } catch (Throwable $e) {
            $this->logException('BrandController::restore', $e, $ctx);
            return $this->errorResponse('Failed to restore brand.', 500);
        }
    }
}
