<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleInspection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VehicleInspection>
 */
class VehicleInspectionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'vehicle_id' => Vehicle::factory(),
            'inspected_by' => User::factory(),
            'inspected_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'odometer' => $this->faker->numberBetween(1000, 100000),
            'notes' => null,
        ];
    }
}
