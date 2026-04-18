<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreSeriesRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'    => [
                'required', 'string', 'min:1', 'max:255',
                Rule::unique('transaction_series', 'name'),
            ],
            'modules'                       => 'required|array|min:1',
            'modules.*.module'              => 'required|string|max:100',
            'modules.*.prefix'              => 'nullable|string|max:100',
            'modules.*.starting_number'     => 'required|string|max:20',
            'modules.*.restart_numbering'   => 'required|in:None,Every Month,Every Year',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'                          => 'Series name is required.',
            'name.max'                               => 'Series name cannot exceed 255 characters.',
            'name.unique'                            => 'A transaction series with this name already exists.',
            'modules.required'                       => 'At least one module configuration is required.',
            'modules.min'                            => 'At least one module configuration is required.',
            'modules.*.module.required'              => 'Module identifier is required for each entry.',
            'modules.*.starting_number.required'     => 'Starting number is required for each module.',
            'modules.*.restart_numbering.required'   => 'Restart numbering option is required.',
            'modules.*.restart_numbering.in'         => 'Restart numbering must be: None, Every Month, or Every Year.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $modules = $this->input('modules', []);
            if (!is_array($modules)) return;

            // No duplicate module identifiers in the same series
            $seen = [];
            foreach ($modules as $i => $m) {
                $key = $m['module'] ?? null;
                if (!$key) continue;
                if (in_array($key, $seen, true)) {
                    $v->errors()->add("modules.{$i}.module", "Module \"{$key}\" is defined more than once in this series.");
                } else {
                    $seen[] = $key;
                }
            }

            // starting_number must be a positive integer string
            foreach ($modules as $i => $m) {
                $start = $m['starting_number'] ?? null;
                if ($start !== null && (!ctype_digit((string) $start) || (int) $start < 1)) {
                    $v->errors()->add("modules.{$i}.starting_number", 'Starting number must be a positive whole number (e.g. 1, 100).');
                }
            }
        });
    }
}
