<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CategoryController::index');

        try {
            $categories = Category::select('id', 'name', 'parent_id')
                ->when($request->boolean('trashed'), fn ($q) => $q->onlyTrashed())
                ->with('parent:id,name')
                ->orderBy('name')
                ->get();

            return $this->successResponse(['data' => $categories]);

        } catch (Throwable $e) {
            $this->logException('CategoryController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch categories.', 500);
        }
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CategoryController::store');

        try {
            $category = Category::create($request->validated());
            Log::info('[CategoryController] Created', array_merge($ctx, ['category_id' => $category->id]));
            return $this->successResponse([
                'message' => 'Category created.',
                'data'    => $category->load('parent:id,name'),
            ], 201);

        } catch (Throwable $e) {
            $this->logException('CategoryController::store', $e, $ctx);
            return $this->errorResponse('Failed to create category.', 500);
        }
    }

    public function update(UpdateCategoryRequest $request, int $category): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CategoryController::update', ['category_id' => $category]);

        try {
            $record = Category::findOrFail($category);
            $record->update($request->validated());
            Log::info('[CategoryController] Updated', array_merge($ctx, ['category_id' => $category]));
            return $this->successResponse([
                'message' => 'Category updated.',
                'data'    => $record->load('parent:id,name'),
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Category not found.', 404);
        } catch (Throwable $e) {
            $this->logException('CategoryController::update', $e, $ctx);
            return $this->errorResponse('Failed to update category.', 500);
        }
    }

    public function destroy(Request $request, int $category): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CategoryController::destroy', ['category_id' => $category]);

        try {
            $record = Category::findOrFail($category);

            // Block deletion if this category has active children
            $childCount = Category::where('parent_id', $category)->count();
            if ($childCount > 0) {
                return $this->errorResponse(
                    "Cannot delete this category because it has {$childCount} sub-categor" .
                    ($childCount === 1 ? 'y' : 'ies') . '. Remove or reassign them first.',
                    422
                );
            }

            $record->delete();
            Log::info('[CategoryController] Deleted', $ctx);
            return $this->successResponse(['message' => 'Category deleted.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Category not found.', 404);
        } catch (Throwable $e) {
            $this->logException('CategoryController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete category.', 500);
        }
    }

    public function restore(Request $request, int $category): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CategoryController::restore', ['category_id' => $category]);

        try {
            Category::onlyTrashed()->findOrFail($category)->restore();
            Log::info('[CategoryController] Restored', array_merge($ctx, ['category_id' => $category]));
            return $this->successResponse(['message' => 'Category restored.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Deleted category not found.', 404);
        } catch (Throwable $e) {
            $this->logException('CategoryController::restore', $e, $ctx);
            return $this->errorResponse('Failed to restore category.', 500);
        }
    }
}
