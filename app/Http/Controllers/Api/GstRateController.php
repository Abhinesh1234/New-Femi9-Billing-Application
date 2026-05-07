<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGstRateRequest;
use App\Http\Requests\UpdateGstRateRequest;
use App\Models\GstRate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class GstRateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'GstRateController::index');

        try {
            $rates = GstRate::select('id', 'label', 'rate')
                ->when($request->boolean('trashed'), fn ($q) => $q->onlyTrashed())
                ->orderBy('rate')
                ->get();

            return $this->successResponse(['data' => $rates]);

        } catch (Throwable $e) {
            $this->logException('GstRateController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch GST rates.', 500);
        }
    }

    public function store(StoreGstRateRequest $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'GstRateController::store');

        try {
            $rate = GstRate::create($request->validated());
            Log::info('[GstRateController] Created', array_merge($ctx, ['gst_rate_id' => $rate->id]));
            return $this->successResponse(['message' => 'GST rate created.', 'data' => $rate], 201);

        } catch (Throwable $e) {
            $this->logException('GstRateController::store', $e, $ctx);
            return $this->errorResponse('Failed to create GST rate.', 500);
        }
    }

    public function update(UpdateGstRateRequest $request, int $gstRate): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'GstRateController::update', ['gst_rate_id' => $gstRate]);

        try {
            $record = GstRate::findOrFail($gstRate);
            $record->update($request->validated());
            Log::info('[GstRateController] Updated', $ctx);
            return $this->successResponse(['message' => 'GST rate updated.', 'data' => $record]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('GST rate not found.', 404);
        } catch (Throwable $e) {
            $this->logException('GstRateController::update', $e, $ctx);
            return $this->errorResponse('Failed to update GST rate.', 500);
        }
    }

    public function destroy(Request $request, int $gstRate): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'GstRateController::destroy', ['gst_rate_id' => $gstRate]);

        try {
            GstRate::findOrFail($gstRate)->delete();
            Log::info('[GstRateController] Deleted', $ctx);
            return $this->successResponse(['message' => 'GST rate deleted.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('GST rate not found.', 404);
        } catch (Throwable $e) {
            $this->logException('GstRateController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete GST rate.', 500);
        }
    }

    public function restore(Request $request, int $gstRate): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'GstRateController::restore', ['gst_rate_id' => $gstRate]);

        try {
            GstRate::onlyTrashed()->findOrFail($gstRate)->restore();
            Log::info('[GstRateController] Restored', array_merge($ctx, ['gst_rate_id' => $gstRate]));
            return $this->successResponse(['message' => 'GST rate restored.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Deleted GST rate not found.', 404);
        } catch (Throwable $e) {
            $this->logException('GstRateController::restore', $e, $ctx);
            return $this->errorResponse('Failed to restore GST rate.', 500);
        }
    }
}
