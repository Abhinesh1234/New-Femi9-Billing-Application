<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateLocationRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'                  => 'sometimes|required|string|min:1|max:255',
            'type'                  => 'sometimes|required|in:business,warehouse',
            'parent_id'             => 'nullable|integer|exists:locations,id',
            'is_active'             => 'boolean',
            'logo_type'             => 'nullable|in:org,custom',
            'logo_path'             => 'nullable|string|max:500',
            'website_url'           => 'nullable|url|max:500',
            'primary_contact_id'    => 'nullable|integer|exists:users,id',
            'txn_series_id'         => 'nullable|integer|exists:transaction_series,id',
            'default_txn_series_id' => 'nullable|integer|exists:transaction_series,id',

            'address'               => 'nullable|array',
            'address.attention'     => 'nullable|string|max:255',
            'address.street1'       => 'nullable|string|max:255',
            'address.street2'       => 'nullable|string|max:255',
            'address.city'          => 'nullable|string|max:100',
            'address.pin_code'      => 'nullable|string|max:20',
            'address.country'       => 'nullable|string|max:10',
            'address.state'         => 'nullable|string|max:10',
            'address.phone'         => 'nullable|string|max:30',
            'address.fax'           => 'nullable|string|max:30',

            'access_users'              => 'nullable|array',
            'access_users.*.user_id'    => 'required|integer|exists:users,id',
            'access_users.*.role'       => 'required|string|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'                 => 'Location name is required.',
            'name.max'                      => 'Location name cannot exceed 255 characters.',
            'type.required'                 => 'Location type is required.',
            'type.in'                       => 'Location type must be Business or Warehouse.',
            'parent_id.exists'              => 'The selected parent location does not exist.',
            'website_url.url'               => 'Website must be a valid URL (include https://).',
            'txn_series_id.exists'          => 'The selected transaction series does not exist.',
            'default_txn_series_id.exists'  => 'The selected default transaction series does not exist.',
            'access_users.*.user_id.exists' => 'One or more selected users do not exist.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $locationId = (int) $this->route('id');
            $parentId   = (int) $this->input('parent_id');

            // Guard: location cannot be its own parent
            if ($parentId && $parentId === $locationId) {
                $v->errors()->add('parent_id', 'A location cannot be its own parent.');
                return;
            }

            // Guard: no duplicate user_id in access_users
            $users = $this->input('access_users', []);
            if (!is_array($users) || count($users) < 2) return;

            $seen = [];
            foreach ($users as $i => $u) {
                $uid = $u['user_id'] ?? null;
                if (!$uid) continue;
                if (in_array((int) $uid, $seen, true)) {
                    $v->errors()->add("access_users.{$i}.user_id", 'This user is listed more than once.');
                } else {
                    $seen[] = (int) $uid;
                }
            }
        });
    }
}
