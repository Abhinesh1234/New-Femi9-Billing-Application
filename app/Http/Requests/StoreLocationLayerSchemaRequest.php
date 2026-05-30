<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLocationLayerSchemaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'depth'          => ['required', 'integer', 'min:1', 'max:20'],
            'layer_name'     => ['required', 'string', 'max:50'],
            'parent_node_id' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
