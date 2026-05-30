<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $roleId = $this->route('role')?->id ?? $this->route('id');

        return [
            'name'        => ['required', 'string', 'max:100', Rule::unique('roles', 'name')->ignore($roleId)->whereNull('deleted_at')],
            'description' => ['nullable', 'string', 'max:500'],

            'permissions'            => ['nullable', 'array'],
            'permissions.*.module'   => ['required', 'string', 'max:60'],
            'permissions.*.can_view'   => ['boolean'],
            'permissions.*.can_create' => ['boolean'],
            'permissions.*.can_edit'   => ['boolean'],
            'permissions.*.can_delete' => ['boolean'],
            'permissions.*.can_others'  => ['boolean'],
            'permissions.*.others_data' => ['nullable', 'array'],
        ];
    }
}
