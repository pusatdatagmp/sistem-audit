<?php

namespace Database\Factories;

use App\Models\EquipmentRequest;
use App\Models\Kitchen;
use App\Models\KitchenTool;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EquipmentRequest>
 */
class EquipmentRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'requested_by' => User::factory(),
            'kitchen_id' => Kitchen::factory(),
            'kitchen_tool_id' => KitchenTool::factory(),
            'quantity' => $this->faker->numberBetween(1, 10),
            'reason' => $this->faker->sentence(8),
            'status' => EquipmentRequest::STATUS_PENDING,
        ];
    }

    public function forNewTool(): static
    {
        return $this->state(fn (array $attributes) => [
            'kitchen_tool_id' => null,
            'new_tool_name' => $this->faker->words(3, true),
            'new_tool_unit' => 'pcs',
            'new_tool_category_option_id' => null,
        ]);
    }
}
