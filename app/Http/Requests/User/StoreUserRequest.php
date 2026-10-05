<?php

namespace App\Http\Requests\User;

use App\Models\Role;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $driverRoleId = Role::query()->where('code', Role::CODE_DRIVER)->value('id');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role_id' => ['required', 'integer', 'exists:roles,id'],
            'kitchen_id' => [Rule::requiredIf((int) $this->input('role_id') === $driverRoleId), 'nullable', 'integer', 'exists:kitchens,id'],
        ];
    }
}
