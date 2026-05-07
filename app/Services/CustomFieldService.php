<?php

namespace App\Services;

use App\Models\CustomField;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class CustomFieldService
{
    private const CACHE_PREFIX = 'custom_fields:';
    private const CACHE_TTL    = 3600; // 1 hour

    /**
     * List all active custom fields for a module, ordered by sort_order.
     * Result is cached per module.
     */
    public function list(string $module): array
    {
        return Cache::remember(
            self::CACHE_PREFIX . $module,
            self::CACHE_TTL,
            fn () => CustomField::where('module', $module)
                ->orderByRaw("CAST(JSON_UNQUOTE(JSON_EXTRACT(config, '$.sort_order')) AS UNSIGNED)")
                ->get(['id', 'config', 'created_at', 'updated_at'])
                ->toArray()
        );
    }

    /**
     * Check whether a field_key already exists for a module.
     * Checks including soft-deleted rows so a deleted key cannot be re-used
     * (a restored record would otherwise create a duplicate key).
     * Optionally exclude a specific ID (for update uniqueness check).
     */
    public function fieldKeyExists(string $module, string $fieldKey, ?int $excludeId = null): bool
    {
        return CustomField::withTrashed()
            ->where('module', $module)
            ->where('config->field_key', $fieldKey)
            ->when($excludeId !== null, fn ($q) => $q->where('id', '!=', $excludeId))
            ->exists();
    }

    /**
     * Create a new custom field inside a transaction.
     * Busts the module cache on success.
     *
     * @throws Throwable
     */
    public function create(string $module, array $config): CustomField
    {
        try {
            return DB::transaction(function () use ($module, $config) {
                $field = CustomField::create([
                    'module' => $module,
                    'config' => $this->normalizeConfig($config),
                ]);

                $this->bustCache($module);

                Log::info('[CustomFieldService] Created', [
                    'module'    => $module,
                    'id'        => $field->id,
                    'field_key' => $field->config['field_key'],
                    'data_type' => $field->config['data_type'],
                ]);

                return $field;
            });
        } catch (Throwable $e) {
            Log::error('[CustomFieldService] Create failed', [
                'module' => $module,
                'error'  => $e->getMessage(),
                'file'   => $e->getFile(),
                'line'   => $e->getLine(),
                'trace'  => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Update a custom field inside a transaction.
     * is_system is always preserved from the existing record — cannot be changed via API.
     * Busts the module cache on success.
     *
     * @throws Throwable
     */
    public function update(CustomField $field, array $config): CustomField
    {
        try {
            return DB::transaction(function () use ($field, $config) {
                // Preserve is_system — value comes from the existing record, not API input.
                $config['is_system'] = $field->config['is_system'] ?? false;

                // For system fields, lock immutable schema properties so no API call
                // can change what the field fundamentally is.
                if ($config['is_system']) {
                    $config['data_type']  = $field->config['data_type'];
                    $config['field_key']  = $field->config['field_key'];
                    $config['label']      = $field->config['label'];
                }

                $old = $field->config;
                $field->update(['config' => $this->normalizeConfig($config)]);

                $this->bustCache($field->module);

                Log::info('[CustomFieldService] Updated', [
                    'module'  => $field->module,
                    'id'      => $field->id,
                    'changes' => $this->diff($old, $config),
                ]);

                return $field->fresh();
            });
        } catch (Throwable $e) {
            Log::error('[CustomFieldService] Update failed', [
                'module' => $field->module,
                'id'     => $field->id,
                'error'  => $e->getMessage(),
                'file'   => $e->getFile(),
                'line'   => $e->getLine(),
                'trace'  => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Soft-delete a custom field inside a transaction.
     * Busts the module cache on success.
     *
     * @throws Throwable
     */
    public function delete(CustomField $field): void
    {
        try {
            DB::transaction(function () use ($field) {
                $field->delete();
                $this->bustCache($field->module);

                Log::info('[CustomFieldService] Deleted', [
                    'module'    => $field->module,
                    'id'        => $field->id,
                    'field_key' => $field->config['field_key'] ?? null,
                ]);
            });
        } catch (Throwable $e) {
            Log::error('[CustomFieldService] Delete failed', [
                'module' => $field->module,
                'id'     => $field->id,
                'error'  => $e->getMessage(),
                'file'   => $e->getFile(),
                'line'   => $e->getLine(),
                'trace'  => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Apply defaults for optional config keys and strip HTML from text fields.
     */
    private function normalizeConfig(array $config): array
    {
        // Strip HTML from user-supplied text fields.
        $config['label']     = strip_tags(trim($config['label']));
        $config['help_text'] = isset($config['help_text'])
            ? strip_tags(trim($config['help_text']))
            : null;

        return array_merge([
            'is_mandatory'         => false,
            'is_active'            => true,
            'is_system'            => false,
            'sort_order'           => 0,
            'help_text'            => null,
            'show_in_transactions' => false,
            'show_in_all_pdfs'     => false,
            'include_in_modules'   => [],
            'default_value'        => null,
            'privacy'              => [
                'is_pii'       => false,
                'is_ephi'      => false,
                'encrypt_data' => false,
            ],
            'type_config'          => [],
        ], $config);
    }

    /**
     * Return only the keys that changed (from → to) for audit logging.
     */
    private function diff(array $old, array $new): array
    {
        $changed = [];

        foreach ($new as $key => $value) {
            if (!array_key_exists($key, $old) || $old[$key] !== $value) {
                $changed[$key] = ['from' => $old[$key] ?? null, 'to' => $value];
            }
        }

        return $changed;
    }

    private function bustCache(string $module): void
    {
        Cache::forget(self::CACHE_PREFIX . $module);
    }
}
