<?php

namespace Database\Factories;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'role_id' => $this->roleId(Role::CODE_ADMIN),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the user is a regular reporter (staff), not an admin.
     */
    public function reporter(): static
    {
        return $this->state(fn (array $attributes) => [
            'role_id' => $this->roleId(Role::CODE_REPORTER),
        ]);
    }

    /**
     * Indicate that the user is a driver who logs their own vehicle usage.
     */
    public function driver(): static
    {
        return $this->state(fn (array $attributes) => [
            'role_id' => $this->roleId(Role::CODE_DRIVER),
        ]);
    }

    /**
     * Resolve the id of one of the system roles, seeding the roles/permissions
     * catalog on first use so tests don't need to seed it explicitly.
     */
    private function roleId(string $code): int
    {
        if (! Role::query()->where('code', Role::CODE_ADMIN)->exists()) {
            (new RoleSeeder)->run();
        }

        return Role::query()->where('code', $code)->value('id');
    }
}
