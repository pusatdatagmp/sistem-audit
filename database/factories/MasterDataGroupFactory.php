<?php

namespace Database\Factories;

use App\Models\MasterDataGroup;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MasterDataGroup>
 */
class MasterDataGroupFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => $this->faker->unique()->slug(2, false),
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'is_locked' => false,
        ];
    }
}
