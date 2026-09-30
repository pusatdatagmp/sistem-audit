<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StockOpnameRequest extends FormRequest
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
            'counted' => ['required', 'array'],
            'counted.baik' => ['required', 'integer', 'min:0'],
            'counted.perlu-perbaikan' => ['required', 'integer', 'min:0'],
            'counted.rusak-berat' => ['required', 'integer', 'min:0'],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
