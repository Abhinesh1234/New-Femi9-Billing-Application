<?php

namespace App\Http\Requests;

use App\Services\SettingService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePartyRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $partyId    = (int) $this->route('id');
        $catId      = $this->input('distribution_category_id');
        $mobileCode = $this->input('mobile_code') ?? '';

        $allowDuplicateNames = app(SettingService::class)->get('customers')['allow_duplicate_names'] ?? true;

        $mobileRules = ['nullable', 'string', 'max:30'];
        if ($catId) {
            $mobileRules[] = Rule::unique('parties', 'mobile')
                ->ignore($partyId)
                ->where(fn ($q) => $q
                    ->where('distribution_category_id', $catId)
                    ->where('mobile_code', $mobileCode)
                    ->whereNull('deleted_at')
                );
        }

        return [
            // ── Core ──────────────────────────────────────────────────────────
            'party_type'                        => 'sometimes|in:business,individual',
            'salutation'                        => 'nullable|string|max:20',
            'first_name'                        => 'nullable|string|max:100',
            'last_name'                         => 'nullable|string|max:100',
            'company_name'                      => 'nullable|string|max:255',
            'display_name'                      => array_filter([
                'required', 'string', 'max:255',
                $allowDuplicateNames ? null : Rule::unique('parties', 'display_name')->whereNull('deleted_at')->ignore($partyId),
            ]),
            'email'                             => 'nullable|email|max:255',
            'work_phone_code'                   => 'nullable|string|max:15',
            'work_phone'                        => 'nullable|string|max:30',
            'mobile_code'                       => 'nullable|string|max:15',
            'mobile'                            => $mobileRules,
            'language'                          => 'nullable|string|max:50',

            // ── Classification ─────────────────────────────────────────────────
            'distribution_category_id'          => 'nullable|integer|exists:distribution_categories,id',
            'distribution_sub_category_id'      => 'nullable|integer|exists:distribution_sub_categories,id',
            'parent_party_id'                   => 'nullable|integer|exists:parties,id',

            // ── Financial ──────────────────────────────────────────────────────
            'pan'                               => ['nullable', 'string', 'max:20', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i'],
            'gst'                               => ['nullable', 'string', 'size:15', 'regex:/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/'],
            'account_number'                    => 'nullable|string|max:50',
            'ifsc_code'                         => 'nullable|string|max:20',
            'upi_number'                        => 'nullable|string|max:50',
            'currency'                          => ['nullable', 'string', 'regex:/^[A-Z]{3}$/'],
            'payment_terms'                     => 'nullable|string|max:50',
            'enable_portal'                     => 'boolean',

            // ── Media & notes ──────────────────────────────────────────────────
            'party_image'                       => 'nullable|string|max:500',
            'remarks'                           => 'nullable|string|max:5000',

            // ── Contact persons ────────────────────────────────────────────────
            'contact_persons'                   => 'nullable|array|max:20',
            'contact_persons.*.salutation'      => 'nullable|string|max:20',
            'contact_persons.*.name'            => 'nullable|string|max:255',
            'contact_persons.*.email'           => 'nullable|email|max:255',
            'contact_persons.*.mobile_code'     => 'nullable|string|max:15',
            'contact_persons.*.mobile'          => 'nullable|string|max:30',

            // ── Custom fields ──────────────────────────────────────────────────
            'custom_fields'                     => 'nullable|array',

            // ── Documents ─────────────────────────────────────────────────────
            'documents'                         => 'nullable|array|max:10',
            'documents.*.file_name'             => 'required_with:documents|string|max:255',
            'documents.*.file_path'             => 'required_with:documents|string|max:500',
            'documents.*.file_size'             => 'nullable|integer|min:0',
            'documents.*.mime_type'             => 'nullable|string|max:100',

            // ── Billing address ────────────────────────────────────────────────
            'billing_address'                   => 'nullable|array',
            'billing_address.attention'         => 'nullable|string|max:100',
            'billing_address.country'           => 'nullable|string|max:255',
            'billing_address.street1'           => 'nullable|string|max:255',
            'billing_address.street2'           => 'nullable|string|max:255',
            'billing_address.city'              => 'nullable|string|max:100',
            'billing_address.state'             => 'nullable|string|max:100',
            'billing_address.pin_code'          => 'nullable|string|max:20',
            'billing_address.phone_code'        => 'nullable|string|max:15',
            'billing_address.phone'             => 'nullable|string|max:30',
            'billing_address.fax'               => 'nullable|string|max:30',

            // ── Shipping address ───────────────────────────────────────────────
            'shipping_address'                  => 'nullable|array',
            'shipping_address.attention'        => 'nullable|string|max:100',
            'shipping_address.country'          => 'nullable|string|max:255',
            'shipping_address.street1'          => 'nullable|string|max:255',
            'shipping_address.street2'          => 'nullable|string|max:255',
            'shipping_address.city'             => 'nullable|string|max:100',
            'shipping_address.state'            => 'nullable|string|max:100',
            'shipping_address.pin_code'         => 'nullable|string|max:20',
            'shipping_address.phone_code'       => 'nullable|string|max:15',
            'shipping_address.phone'            => 'nullable|string|max:30',
            'shipping_address.fax'              => 'nullable|string|max:30',

            // ── Locations ──────────────────────────────────────────────────────
            'location_node_ids'                 => 'nullable|array',
            'location_node_ids.*'               => 'integer|exists:distribution_location_nodes,id',
            'location_type'                     => 'nullable|in:unified,separate',

            // ── Role & Permissions ─────────────────────────────────────────────
            'role_id'                           => 'nullable|integer|exists:roles,id',
            'permissions'                       => 'nullable|array',
            'permissions.*.module'              => 'required_with:permissions|string',
            'permissions.*.can_view'            => 'required_with:permissions|boolean',
            'permissions.*.can_create'          => 'required_with:permissions|boolean',
            'permissions.*.can_edit'            => 'required_with:permissions|boolean',
            'permissions.*.can_delete'          => 'required_with:permissions|boolean',
            'permissions.*.can_others'          => 'required_with:permissions|boolean',
            'permissions.*.others_data'         => 'nullable|array',
        ];
    }

    public function messages(): array
    {
        return [
            'display_name.required'                    => 'Display name is required.',
            'display_name.unique'                      => 'A party with this display name already exists.',
            'email.email'                              => 'Please enter a valid email address.',
            'mobile.unique'                            => 'This mobile number is already registered under the selected distribution category.',
            'pan.regex'                                => 'PAN must be in the format: AAAAA9999A (5 letters, 4 digits, 1 letter).',
            'gst.size'                                 => 'GSTIN must be exactly 15 characters.',
            'gst.regex'                                => 'GSTIN format: 2 digits (state) + 5 letters (PAN) + 4 digits + 1 letter + entity + Z + checksum.',
            'currency.regex'                           => 'Currency must be a valid 3-letter ISO 4217 code (e.g. INR, USD, EUR).',
            'distribution_category_id.exists'         => 'The selected distribution category does not exist.',
            'distribution_sub_category_id.exists'     => 'The selected sub-category does not exist.',
            'parent_party_id.exists'                   => 'The selected parent party does not exist.',
            'contact_persons.*.email.email'           => 'Contact person email must be a valid email address.',
            'documents.max'                           => 'You can upload a maximum of 10 documents.',
            'location_node_ids.*.exists'              => 'One or more selected locations do not exist.',
        ];
    }
}
