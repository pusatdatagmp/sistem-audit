<?php

namespace Database\Factories;

use App\Models\KitchenTool;
use App\Models\MasterDataOption;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<KitchenTool>
 */
class KitchenToolFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => $this->faker->unique()->bothify('ALT-####'),
            'name' => $this->faker->randomElement(['Panci', 'Wajan', 'Pisau', 'Talenan', 'Rice Cooker', 'Termos Nasi']),
            'unit' => 'pcs',
            'category_option_id' => MasterDataOption::factory(),
            'description' => null,
            'is_active' => true,
        ];
    }
}
