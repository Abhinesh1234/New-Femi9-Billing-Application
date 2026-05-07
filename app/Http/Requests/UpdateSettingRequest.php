<?php

namespace App\Http\Requests;

use App\Support\SettingValidationRules;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;

class UpdateSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $module = $this->route('module');

        $this->logDebug('rules() called', __FILE__, __FUNCTION__, __LINE__, [
            'module'       => $module,
            'payload_keys' => array_keys($this->all()),
        ]);

        try {
            $rules = SettingValidationRules::forModule($module);

            $this->logDebug('Validation rules resolved', __FILE__, __FUNCTION__, __LINE__, [
                'module' => $module,
                'rules'  => array_keys($rules),
            ]);

            return $rules;
        } catch (InvalidArgumentException) {
            $this->logDebug('Unknown module — skipping validation rules', __FILE__, __FUNCTION__, __LINE__, [
                'module' => $module,
            ]);
            return [];
        }
    }

    public function messages(): array
    {
        return [
            'decimal_rate.between'             => 'Decimal rate must be between 0 and 6.',
            'dimension_unit.in'                => 'Invalid dimension unit selected.',
            'weight_unit.in'                   => 'Invalid weight unit selected.',
            'barcode_scan_using.in'            => 'Invalid barcode scan field selected.',
            'inventory_start_date.date'        => 'Inventory start date must be a valid date.',
            'inventory_start_date.date_format' => 'Inventory start date must be in YYYY-MM-DD format.',
            'stock_level.required_if'          => 'Stock level is required when preventing stock from going below zero.',
            'stock_level.in'                   => 'Stock level must be either "org" or "location".',
            'tracking_preference.required_if'  => 'Tracking preference is required when serial or batch tracking is enabled.',
            'tracking_preference.in'           => 'Tracking preference must be "packages" or "invoices".',
            'notify_to_email.required'         => 'Notification email is required when reorder notification is enabled.',
            'notify_to_email.email'            => 'Notification email must be a valid email address.',
        ];
    }

    /**
     * Return a JSON error response instead of redirecting on validation failure.
     */
    protected function failedValidation(Validator $validator): never
    {
        $errors = $validator->errors()->toArray();

        Log::error('━━━ SETTINGS VALIDATION FAILED ━━━', [
            'datetime'       => now()->format('Y-m-d H:i:s.u'),
            'file'           => __FILE__,
            'function'       => __FUNCTION__,
            'line'           => __LINE__,
            'module'         => $this->route('module'),
            'ip'             => $this->ip(),
            'failing_fields' => array_keys($errors),
            'errors'         => $errors,
            'payload_keys'   => array_keys($this->all()),
        ]);

        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation failed. Please check the highlighted fields.',
                'errors'  => $validator->errors(),
            ], 422)
        );
    }

    /**
     * Structured debug log with file / function / line context.
     */
    private function logDebug(string $message, string $file, string $function, int $line, array $context = []): void
    {
        Log::debug('[SettingRequest] ' . $message, array_merge([
            'datetime' => now()->format('Y-m-d H:i:s.u'),
            'file'     => $file,
            'function' => $function,
            'line'     => $line,
        ], $context));
    }
}
