<?php

namespace App\Http\Requests\Ticket;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTicketRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'kitchen_id' => ['nullable', 'integer', 'exists:kitchens,id'],
            'category_option_id' => ['required', 'integer', 'exists:master_data_options,id'],
            'priority_option_id' => ['required', 'integer', 'exists:master_data_options,id'],
            'related_kitchen_tool_id' => ['nullable', 'integer', 'exists:kitchen_tools,id'],
            'related_vehicle_id' => ['nullable', 'integer', 'exists:vehicles,id'],
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:2000'],
        ];
    }
}
