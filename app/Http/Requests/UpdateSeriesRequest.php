<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateSeriesRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $seriesId = (int) $this->route('id');

        return [
            'name' => [
                'sometimes', 'required', 'string', 'min:1', 'max:255',
                Rule::unique('transaction_series', 'name')->ignore($seriesId),
            ],
            'customer_category' => 'sometimes|nullable|string|in:retail,wholesale,vip,corporate,distributor',
            'modules'                       => 'sometimes|required|array|min:1',
            'modules.*.module'              => 'required_with:modules|string|max:100',
            'modules.*.prefix'              => 'nullable|string|max:100',
            'modules.*.starting_number'     => 'required_with:modules|string|max:20',
            'modules.*.restart_numbering'   => 'required_with:modules|in:None,Every Month,Every Year',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'                        => 'Series name is required.',
            'name.unique'                          => 'A transaction series with this name already exists.',
            'modules.min'                          => 'At least one module configuration is required.',
            'modules.*.module.required_with'       => 'Module identifier is required for each entry.',
            'modules.*.starting_number.required_with' => 'Starting number is required for each module.',
            'modules.*.restart_numbering.in'       => 'Restart numbering must be: None, Every Month, or Every Year.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $modules = $this->input('modules');
            if (!is_array($modules)) return;

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

            foreach ($modules as $i => $m) {
                $start = $m['starting_number'] ?? null;
                if ($start !== null && (!ctype_digit((string) $start) || (int) $start < 1)) {
                    $v->errors()->add("modules.{$i}.starting_number", 'Starting number must be a positive whole number.');
                }
            }
        });
    }
}
