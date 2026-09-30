<?php

namespace App\Http\Requests\Ticket;

use App\Models\ComplaintTicket;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTicketStatusRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in([
                ComplaintTicket::STATUS_OPEN,
                ComplaintTicket::STATUS_IN_PROGRESS,
                ComplaintTicket::STATUS_RESOLVED,
            ])],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
