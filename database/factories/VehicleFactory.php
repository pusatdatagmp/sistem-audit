<?php

namespace Database\Factories;

use App\Models\MasterDataOption;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vehicle>
 */
class VehicleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'plate_number' => strtoupper($this->faker->unique()->bothify('B #### ???')),
            'vehicle_type_option_id' => MasterDataOption::factory(),
            'status_option_id' => MasterDataOption::factory(),
            'home_kitchen_id' => null,
            'brand' => $this->faker->randomElement(['Mitsubishi', 'Isuzu', 'Toyota', 'Daihatsu']),
            'model' => $this->faker->word(),
            'year' => $this->faker->numberBetween(2015, 2025),
            'is_active' => true,
        ];
    }
}
