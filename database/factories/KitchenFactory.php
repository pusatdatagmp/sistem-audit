<?php

namespace Database\Factories;

use App\Models\Kitchen;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Kitchen>
 */
class KitchenFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => $this->faker->unique()->bothify('KTC-##'),
            'name' => 'Dapur '.$this->faker->city(),
            'address' => $this->faker->address(),
            'pic_name' => $this->faker->name(),
            'phone' => $this->faker->phoneNumber(),
            'is_active' => true,
        ];
    }
}
