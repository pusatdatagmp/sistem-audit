<?php

namespace Database\Factories;

use App\Models\InventoryLog;
use App\Models\KitchenInventory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryLog>
 */
class InventoryLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'kitchen_inventory_id' => KitchenInventory::factory(),
            'type' => InventoryLog::TYPE_IN,
            'condition_option_id' => null,
            'quantity_change' => $this->faker->numberBetween(1, 10),
            'stock_before' => 0,
            'stock_after' => 0,
            'transfer_group_id' => null,
            'related_kitchen_id' => null,
            'performed_by' => User::factory(),
            'note' => null,
        ];
    }
}
