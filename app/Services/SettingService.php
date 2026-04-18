<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class SettingService
{
    private const CACHE_PREFIX = 'settings:';
    private const CACHE_TTL    = 3600; // 1 hour

    /**
     * Retrieve settings for a module.
     * Results are cached to avoid repeated DB hits.
     */
    public function get(string $module): ?array
    {
        return Cache::remember(
            self::CACHE_PREFIX . $module,
            self::CACHE_TTL,
            fn () => Setting::getForModule($module)
        );
    }

    /**
     * Update (or create) settings for a module.
     * Deep-merges incoming data with existing configuration to
     * ensure no existing keys are accidentally wiped.
     *
     * @throws Throwable
     */
    public function update(string $module, array $data): array
    {
        try {
            return DB::transaction(function () use ($module, $data) {

                // Lock the row to prevent race conditions on concurrent saves.
                $setting = Setting::lockForUpdate()
                    ->firstOrNew(['module' => $module]);

                $existing = $setting->configuration ?? [];
                $merged   = $this->deepMerge($existing, $data);

                $setting->module        = $module;
                $setting->configuration = $merged;
                $setting->save();

                // Bust cache immediately after save.
                Cache::forget(self::CACHE_PREFIX . $module);

                Log::info('Settings updated', [
                    'module'  => $module,
                    'changes' => $this->diff($existing, $data),
                ]);

                return $merged;
            });
        } catch (Throwable $e) {
            Log::error('Failed to update settings', [
                'module'  => $module,
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
                'trace'   => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Recursively merge $new into $existing.
     * New values override existing; untouched keys are preserved.
     */
    private function deepMerge(array $existing, array $new): array
    {
        foreach ($new as $key => $value) {
            if (is_array($value) && isset($existing[$key]) && is_array($existing[$key])) {
                $existing[$key] = $this->deepMerge($existing[$key], $value);
            } else {
                $existing[$key] = $value;
            }
        }

        return $existing;
    }

    /**
     * Return only the keys that actually changed.
     */
    private function diff(array $existing, array $incoming): array
    {
        $changed = [];

        foreach ($incoming as $key => $value) {
            if (!array_key_exists($key, $existing) || $existing[$key] !== $value) {
                $changed[$key] = [
                    'from' => $existing[$key] ?? null,
                    'to'   => $value,
                ];
            }
        }

        return $changed;
    }
}
