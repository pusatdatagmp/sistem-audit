<?php

namespace App\Http\Requests\Vehicle;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVehicleRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'plate_number' => ['required', 'string', 'max:20', Rule::unique('vehicles', 'plate_number')->ignore($this->route('vehicle'))],
            'vehicle_type_option_id' => ['required', 'integer', 'exists:master_data_options,id'],
            'status_option_id' => ['required', 'integer', 'exists:master_data_options,id'],
            'home_kitchen_id' => ['nullable', 'integer', 'exists:kitchens,id'],
            'brand' => ['nullable', 'string', 'max:100'],
            'model' => ['nullable', 'string', 'max:100'],
            'year' => ['nullable', 'integer', 'min:1980', 'max:'.(date('Y') + 1)],
            'is_active' => ['boolean'],
        ];
    }
}
