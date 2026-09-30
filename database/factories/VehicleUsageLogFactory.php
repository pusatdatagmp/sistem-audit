<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleUsageLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VehicleUsageLog>
 */
class VehicleUsageLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = $this->faker->numberBetween(1000, 100000);

        return [
            'vehicle_id' => Vehicle::factory(),
            'driver_id' => User::factory(),
            'kitchen_id' => null,
            'usage_date' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'start_odometer' => $start,
            'end_odometer' => $start + $this->faker->numberBetween(5, 200),
            'destination' => $this->faker->city(),
            'purpose' => $this->faker->sentence(),
        ];
    }
}
