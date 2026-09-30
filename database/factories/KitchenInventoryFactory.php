<?php

namespace Database\Factories;

use App\Models\Kitchen;
use App\Models\KitchenInventory;
use App\Models\KitchenTool;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<KitchenInventory>
 */
class KitchenInventoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'kitchen_id' => Kitchen::factory(),
            'kitchen_tool_id' => KitchenTool::factory(),
            'quantity_good' => $this->faker->numberBetween(0, 50),
            'quantity_needs_repair' => 0,
            'quantity_damaged' => 0,
        ];
    }
}
