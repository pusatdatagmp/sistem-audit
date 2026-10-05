<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreEquipmentRequestRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'kitchen_id' => ['required', 'integer', 'exists:kitchens,id'],
            'kitchen_tool_id' => ['nullable', 'integer', 'exists:kitchen_tools,id', 'prohibits:new_tool_name', 'required_without:new_tool_name'],
            'new_tool_name' => ['nullable', 'string', 'max:255', 'required_without:kitchen_tool_id'],
            'new_tool_unit' => ['nullable', 'string', 'max:20', 'required_with:new_tool_name'],
            'new_tool_category_option_id' => ['nullable', 'integer', 'exists:master_data_options,id', 'required_with:new_tool_name'],
            'quantity' => ['required', 'integer', 'min:1'],
            'reason' => ['required', 'string', 'max:1000'],
        ];
    }
}
