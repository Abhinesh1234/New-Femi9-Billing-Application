<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')->whereNull('deleted_at')],
            'phone'    => ['required', 'string', 'max:20', Rule::unique('users', 'phone')->whereNull('deleted_at')],
            'password' => ['required', 'string', Password::min(8)->mixedCase()->numbers()->symbols()],
            'role_id'  => ['required', 'integer', Rule::exists('roles', 'id')],

            'permissions'                => ['nullable', 'array'],
            'permissions.*.module'       => ['required', 'string', 'max:60'],
            'permissions.*.can_view'     => ['boolean'],
            'permissions.*.can_create'   => ['boolean'],
            'permissions.*.can_edit'     => ['boolean'],
            'permissions.*.can_delete'   => ['boolean'],
            'permissions.*.can_others'   => ['boolean'],
            'permissions.*.others_data'  => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.unique'   => 'This phone number is already registered.',
            'email.unique'   => 'This email address is already registered.',
            'role_id.exists' => 'The selected role does not exist.',
        ];
    }
}
