<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCountryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'             => ['required', 'string', 'max:100', 'unique:countries,name'],
            'code'             => ['nullable', 'string', 'max:10', 'unique:countries,code'],
            'is_active'        => ['boolean'],
            'phone_code'       => ['nullable', 'string', 'max:10'],
            'currency_code'    => ['nullable', 'string', 'max:10'],
            'currency_symbol'  => ['nullable', 'string', 'max:10'],
            'phone_digits'     => ['nullable', 'integer', 'min:4', 'max:15'],
        ];
    }
}
