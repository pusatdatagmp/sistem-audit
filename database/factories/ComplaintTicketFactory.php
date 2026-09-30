<?php

namespace Database\Factories;

use App\Models\ComplaintTicket;
use App\Models\MasterDataOption;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ComplaintTicket>
 */
class ComplaintTicketFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reporter_id' => User::factory(),
            'kitchen_id' => null,
            'category_option_id' => MasterDataOption::factory(),
            'priority_option_id' => MasterDataOption::factory(),
            'status' => ComplaintTicket::STATUS_OPEN,
            'subject' => $this->faker->sentence(4),
            'description' => $this->faker->paragraph(),
        ];
    }
}
