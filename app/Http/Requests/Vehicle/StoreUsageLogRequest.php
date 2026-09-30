<?php

namespace App\Http\Requests\Vehicle;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreUsageLogRequest extends FormRequest
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
            'driver_id' => ['required', 'integer', 'exists:users,id'],
            'kitchen_id' => ['nullable', 'integer', 'exists:kitchens,id'],
            'usage_date' => ['required', 'date'],
            'start_odometer' => ['nullable', 'integer', 'min:0'],
            'end_odometer' => ['nullable', 'integer', 'min:0', 'gte:start_odometer'],
            'destination' => ['nullable', 'string', 'max:255'],
            'purpose' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
