<?php

namespace App\Http\Requests\Vehicle;

use App\Models\MasterDataOption;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVehicleInspectionRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'vehicle_id' => ['required', 'integer', 'exists:vehicles,id'],
            'odometer' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.component_option_id' => ['required', 'integer', 'distinct', 'exists:master_data_options,id'],
            'items.*.condition_code' => ['required', 'string', Rule::in(MasterDataOption::ofGroup('physical_condition')->pluck('code'))],
            'items.*.notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
