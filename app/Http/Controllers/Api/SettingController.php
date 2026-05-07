<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomFieldRequest;
use App\Http\Requests\UpdateCustomFieldRequest;
use App\Http\Requests\UpdateSettingRequest;
use App\Models\AuditLog;
use App\Models\CustomField;
use App\Models\Setting;
use App\Services\CustomFieldService;
use App\Services\SettingService;
use App\Support\CustomFieldSupport;
use App\Support\SettingValidationRules;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class SettingController extends Controller
{
    public function __construct(
        private readonly SettingService      $service,
        private readonly CustomFieldService  $customFieldService,
    ) {}

    /**
     * GET /api/settings/{module}
     */
    public function show(Request $request, string $module): JsonResponse
    {
        $ctx = $this->ctx($request, __FILE__, __FUNCTION__, __LINE__, $module);

        if (!array_key_exists($module, SettingValidationRules::MODULES)) {
            Log::warning('[SettingController] Unknown module on fetch', $ctx);
            return $this->errorResponse("Unknown settings module: [{$module}].", 404);
        }

        Log::info('[SettingController] Fetch started', $ctx);

        try {
            $configuration = $this->service->get($module);

            Log::info('[SettingController] Fetch success', array_merge($ctx, [
                'found' => $configuration !== null,
            ]));

            return $this->successResponse([
                'module'        => $module,
                'configuration' => $configuration,
            ]);
        } catch (Throwable $e) {
            Log::error('[SettingController] Fetch failed', array_merge($ctx, [
                'error'      => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'trace'      => $e->getTraceAsString(),
            ]));

            return $this->errorResponse('Failed to fetch settings. Please try again.', 500);
        }
    }

    /**
     * PUT /api/settings/{module}
     */
    public function update(UpdateSettingRequest $request, string $module): JsonResponse
    {
        $ctx = $this->ctx($request, __FILE__, __FUNCTION__, __LINE__, $module);

        if (!array_key_exists($module, SettingValidationRules::MODULES)) {
            Log::warning('[SettingController] Unknown module on update', $ctx);
            return $this->errorResponse("Unknown settings module: [{$module}].", 404);
        }

        Log::info('[SettingController] Update started', array_merge($ctx, [
            'validated_keys' => array_keys($request->validated()),
        ]));

        try {
            $oldConfiguration = $this->service->get($module);
            $configuration    = $this->service->update($module, $request->validated());

            try {
                AuditLog::create([
                    'auditable_type' => 'Setting',
                    'auditable_id'   => Setting::where('module', $module)->value('id') ?? 0,
                    'event'          => 'updated',
                    'user_id'        => $request->user()?->id,
                    'ip_address'     => $request->ip(),
                    'user_agent'     => $request->userAgent(),
                    'old_values'     => $oldConfiguration,
                    'new_values'     => $configuration,
                ]);
            } catch (Throwable) {}

            Log::info('[SettingController] Update success', array_merge($ctx, [
                'saved_keys' => array_keys($configuration),
            ]));

            return $this->successResponse([
                'message'       => 'Settings saved successfully.',
                'module'        => $module,
                'configuration' => $configuration,
            ]);
        } catch (Throwable $e) {
            Log::error('[SettingController] Update failed', array_merge($ctx, [
                'error'      => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'trace'      => $e->getTraceAsString(),
            ]));

            return $this->errorResponse('Failed to save settings. Please try again.', 500);
        }
    }

    // -------------------------------------------------------------------------
    // Custom Fields
    // -------------------------------------------------------------------------

    /**
     * GET /api/custom-fields/show/{id}
     */
    public function showCustomField(Request $request, int $id): JsonResponse
    {
        $ctx = $this->ctx($request, __FILE__, __FUNCTION__, __LINE__, 'custom_field');

        Log::info('[SettingController] CustomField show started', array_merge($ctx, ['id' => $id]));

        try {
            $field = CustomField::find($id);

            if (!$field) {
                Log::warning('[SettingController] CustomField show — not found', array_merge($ctx, ['id' => $id]));
                return $this->errorResponse("Custom field [{$id}] not found.", 404);
            }

            Log::info('[SettingController] CustomField show success', array_merge($ctx, ['id' => $id]));

            return $this->successResponse([
                'message' => 'Custom field fetched successfully.',
                'data'    => $field,
            ]);
        } catch (Throwable $e) {
            Log::error('[SettingController] CustomField show failed', array_merge($ctx, [
                'id'         => $id,
                'error'      => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'trace'      => $e->getTraceAsString(),
            ]));

            return $this->errorResponse('Failed to fetch custom field. Please try again.', 500);
        }
    }

    /**
     * GET /api/custom-fields/{module}
     */
    public function indexCustomFields(Request $request, string $module): JsonResponse
    {
        if (!in_array($module, CustomFieldSupport::MODULES, true)) {
            return $this->errorResponse("Unknown module: [{$module}].", 404);
        }

        $ctx = $this->ctx($request, __FILE__, __FUNCTION__, __LINE__, $module);
        Log::info('[SettingController] CustomField list started', $ctx);

        try {
            $fields = $this->customFieldService->list($module);

            Log::info('[SettingController] CustomField list success', array_merge($ctx, [
                'count' => count($fields),
            ]));

            return $this->successResponse([
                'module' => $module,
                'data'   => $fields,
            ]);
        } catch (Throwable $e) {
            Log::error('[SettingController] CustomField list failed', array_merge($ctx, [
                'error'      => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'trace'      => $e->getTraceAsString(),
            ]));

            return $this->errorResponse('Failed to fetch custom fields. Please try again.', 500);
        }
    }

    /**
     * POST /api/custom-fields
     * Uses StoreCustomFieldRequest — single validated pass, no double-validate.
     */
    public function storeCustomField(StoreCustomFieldRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $module    = $validated['module'];
        $fieldKey  = $validated['config']['field_key'];
        $ctx       = $this->ctx($request, __FILE__, __FUNCTION__, __LINE__, $module);

        if ($this->customFieldService->fieldKeyExists($module, $fieldKey)) {
            Log::warning('[SettingController] CustomField store — duplicate field_key', array_merge($ctx, [
                'field_key' => $fieldKey,
            ]));

            return $this->errorResponse(
                "A custom field with key [{$fieldKey}] already exists for module [{$module}].",
                422
            );
        }

        Log::info('[SettingController] CustomField store started', $ctx);

        try {
            $field = $this->customFieldService->create($module, $validated['config']);

            try {
                AuditLog::create([
                    'auditable_type' => 'CustomField',
                    'auditable_id'   => $field->id,
                    'event'          => 'created',
                    'user_id'        => $request->user()?->id,
                    'ip_address'     => $request->ip(),
                    'user_agent'     => $request->userAgent(),
                    'old_values'     => null,
                    'new_values'     => ['module' => $module, 'config' => $field->config],
                ]);
            } catch (Throwable) {}

            Log::info('[SettingController] CustomField store success', array_merge($ctx, [
                'id' => $field->id,
            ]));

            return $this->successResponse([
                'message' => 'Custom field created successfully.',
                'data'    => $field,
            ], 201);
        } catch (Throwable $e) {
            Log::error('[SettingController] CustomField store failed', array_merge($ctx, [
                'error'      => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'trace'      => $e->getTraceAsString(),
            ]));

            return $this->errorResponse('Failed to create custom field. Please try again.', 500);
        }
    }

    /**
     * PUT /api/custom-fields/{id}
     * Uses UpdateCustomFieldRequest — system fields cannot have data_type/field_key/label changed.
     */
    public function updateCustomField(UpdateCustomFieldRequest $request, int $id): JsonResponse
    {
        $field = CustomField::find($id);

        if (!$field) {
            return $this->errorResponse("Custom field [{$id}] not found.", 404);
        }

        $ctx       = $this->ctx($request, __FILE__, __FUNCTION__, __LINE__, $field->module);
        $validated = $request->validated();

        $newFieldKey = $validated['config']['field_key'];
        $oldFieldKey = $field->config['field_key'] ?? '';

        if ($newFieldKey !== $oldFieldKey && $this->customFieldService->fieldKeyExists($field->module, $newFieldKey, $id)) {
            Log::warning('[SettingController] CustomField update — duplicate field_key', array_merge($ctx, [
                'field_key' => $newFieldKey,
            ]));

            return $this->errorResponse(
                "A custom field with key [{$newFieldKey}] already exists for module [{$field->module}].",
                422
            );
        }

        Log::info('[SettingController] CustomField update started', array_merge($ctx, ['id' => $id]));

        $oldConfig = $field->config;

        try {
            $updated = $this->customFieldService->update($field, $validated['config']);

            try {
                AuditLog::create([
                    'auditable_type' => 'CustomField',
                    'auditable_id'   => $id,
                    'event'          => 'updated',
                    'user_id'        => $request->user()?->id,
                    'ip_address'     => $request->ip(),
                    'user_agent'     => $request->userAgent(),
                    'old_values'     => $oldConfig,
                    'new_values'     => $updated->config,
                ]);
            } catch (Throwable) {}

            Log::info('[SettingController] CustomField update success', array_merge($ctx, ['id' => $id]));

            return $this->successResponse([
                'message' => 'Custom field updated successfully.',
                'data'    => $updated,
            ]);
        } catch (Throwable $e) {
            Log::error('[SettingController] CustomField update failed', array_merge($ctx, [
                'error'      => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'trace'      => $e->getTraceAsString(),
            ]));

            return $this->errorResponse('Failed to update custom field. Please try again.', 500);
        }
    }

    /**
     * DELETE /api/custom-fields/{id}
     * System fields cannot be deleted.
     */
    public function destroyCustomField(Request $request, int $id): JsonResponse
    {
        $field = CustomField::find($id);

        if (!$field) {
            return $this->errorResponse("Custom field [{$id}] not found.", 404);
        }

        // B1 — guard: system fields are immutable
        if ($field->config['is_system'] ?? false) {
            Log::warning('[SettingController] CustomField delete blocked — is_system', [
                'id'     => $id,
                'module' => $field->module,
            ]);
            return $this->errorResponse('System-defined fields cannot be deleted.', 403);
        }

        $ctx      = $this->ctx($request, __FILE__, __FUNCTION__, __LINE__, $field->module);
        $snapshot = $field->config;

        Log::info('[SettingController] CustomField delete started', array_merge($ctx, ['id' => $id]));

        try {
            $this->customFieldService->delete($field);

            try {
                AuditLog::create([
                    'auditable_type' => 'CustomField',
                    'auditable_id'   => $id,
                    'event'          => 'deleted',
                    'user_id'        => $request->user()?->id,
                    'ip_address'     => $request->ip(),
                    'user_agent'     => $request->userAgent(),
                    'old_values'     => $snapshot,
                    'new_values'     => null,
                ]);
            } catch (Throwable) {}

            Log::info('[SettingController] CustomField delete success', array_merge($ctx, ['id' => $id]));

            return $this->successResponse([
                'message' => 'Custom field deleted successfully.',
            ]);
        } catch (Throwable $e) {
            Log::error('[SettingController] CustomField delete failed', array_merge($ctx, [
                'error'      => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'trace'      => $e->getTraceAsString(),
            ]));

            return $this->errorResponse('Failed to delete custom field. Please try again.', 500);
        }
    }

    // -------------------------------------------------------------------------

    protected function ctx(Request $request, string $file, string $function, int $line, string $module): array
    {
        return [
            'tag'      => "SettingController::{$function}",
            'datetime' => now()->format('Y-m-d H:i:s.u'),
            'file'     => $file,
            'function' => $function,
            'line'     => $line,
            'module'   => $module,
            'ip'       => $request->ip(),
            'method'   => $request->method(),
            'url'      => $request->fullUrl(),
            'user_id'  => $request->user()?->id,
        ];
    }
}
