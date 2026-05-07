<?php

namespace App\Http\Requests;

use App\Models\CustomField;
use App\Support\CustomFieldSupport;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Log;

class UpdateCustomFieldRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id       = (int) $this->route('id');
        $existing = CustomField::find($id);

        // Fall back to the existing data_type when not supplied in the request.
        $dataType = $this->input('config.data_type', $existing?->config['data_type'] ?? '');

        return array_merge(
            CustomFieldSupport::baseRules(),
            CustomFieldSupport::typeConfigRules($dataType)
        );
    }

    public function messages(): array
    {
        return [
            'config.label.required'        => 'Label is required.',
            'config.label.max'             => 'Label cannot exceed 255 characters.',
            'config.field_key.required'    => 'Field key is required.',
            'config.field_key.regex'       => 'Field key must start with a letter and contain only lowercase letters, numbers, and underscores.',
            'config.data_type.required'    => 'Data type is required.',
            'config.data_type.in'          => 'Invalid data type selected.',
            'config.sort_order.integer'    => 'Sort order must be a whole number.',
            'config.sort_order.min'        => 'Sort order cannot be negative.',
            'config.sort_order.max'        => 'Sort order cannot exceed 9999.',
            'config.help_text.max'         => 'Help text cannot exceed 1000 characters.',
            'config.default_value.max'     => 'Default value cannot exceed 1000 characters.',
            'config.type_config.starting_number.required' => 'Starting number is required.',
            'config.type_config.starting_number.min'      => 'Starting number must be at least 1.',
            'config.type_config.starting_number.max'      => 'Starting number cannot exceed 999,999,999.',
            'config.type_config.lookup_module.required'   => 'Lookup module is required.',
            'config.type_config.lookup_module.in'         => 'Invalid lookup module selected.',
        ];
    }

    protected function failedValidation(Validator $validator): never
    {
        $errors = $validator->errors()->toArray();

        Log::warning('[UpdateCustomFieldRequest] Validation failed', [
            'datetime'       => now()->format('Y-m-d H:i:s.u'),
            'ip'             => $this->ip(),
            'id'             => $this->route('id'),
            'failing_fields' => array_keys($errors),
            'errors'         => $errors,
        ]);

        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation failed. Please check the highlighted fields.',
                'errors'  => $validator->errors(),
            ], 422)
        );
    }
}
