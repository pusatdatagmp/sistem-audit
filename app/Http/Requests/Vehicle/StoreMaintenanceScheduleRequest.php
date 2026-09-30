<?php

namespace App\Http\Requests\Vehicle;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreMaintenanceScheduleRequest extends FormRequest
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
            'maintenance_type_option_id' => ['required', 'integer', 'exists:master_data_options,id'],
            'status_option_id' => ['required', 'integer', 'exists:master_data_options,id'],
            'scheduled_date' => ['required', 'date'],
            'odometer_at_schedule' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
