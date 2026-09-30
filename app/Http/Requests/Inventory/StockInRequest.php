<?php

namespace App\Http\Requests\Inventory;

use App\Models\MasterDataOption;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StockInRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'kitchen_inventory_id' => ['required', 'integer', 'exists:kitchen_inventories,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'condition_code' => ['required', 'string', Rule::in(MasterDataOption::ofGroup('physical_condition')->pluck('code'))],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
