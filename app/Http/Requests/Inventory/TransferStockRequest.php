<?php

namespace App\Http\Requests\Inventory;

use App\Models\MasterDataOption;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransferStockRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'from_kitchen_id' => ['required', 'integer', 'exists:kitchens,id', 'different:to_kitchen_id'],
            'to_kitchen_id' => ['required', 'integer', 'exists:kitchens,id'],
            'kitchen_tool_id' => ['required', 'integer', 'exists:kitchen_tools,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'condition_code' => ['required', 'string', Rule::in(MasterDataOption::ofGroup('physical_condition')->pluck('code'))],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
