<?php

namespace Database\Factories;

use App\Models\MasterDataOption;
use App\Models\Vehicle;
use App\Models\VehicleMaintenanceSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VehicleMaintenanceSchedule>
 */
class VehicleMaintenanceScheduleFactory extends Factory
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
            'maintenance_type_option_id' => MasterDataOption::factory(),
            'status_option_id' => MasterDataOption::factory(),
            'scheduled_date' => $this->faker->dateTimeBetween('now', '+2 months'),
            'odometer_at_schedule' => $this->faker->numberBetween(1000, 100000),
            'completed_at' => null,
            'completed_by' => null,
            'notes' => null,
        ];
    }
}
