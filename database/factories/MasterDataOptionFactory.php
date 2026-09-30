<?php

namespace Database\Factories;

use App\Models\MasterDataGroup;
use App\Models\MasterDataOption;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MasterDataOption>
 */
class MasterDataOptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'master_data_group_id' => MasterDataGroup::factory(),
            'code' => $this->faker->unique()->slug(2, false),
            'label' => $this->faker->words(2, true),
            'description' => null,
            'sort_order' => 0,
            'is_active' => true,
            'meta' => null,
        ];
    }
}
