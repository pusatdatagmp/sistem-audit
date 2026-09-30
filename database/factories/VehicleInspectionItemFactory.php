<?php

namespace Database\Factories;

use App\Models\MasterDataOption;
use App\Models\VehicleInspection;
use App\Models\VehicleInspectionItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VehicleInspectionItem>
 */
class VehicleInspectionItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'vehicle_inspection_id' => VehicleInspection::factory(),
            'component_option_id' => MasterDataOption::factory(),
            'condition_option_id' => MasterDataOption::factory(),
            'notes' => null,
        ];
    }
}
