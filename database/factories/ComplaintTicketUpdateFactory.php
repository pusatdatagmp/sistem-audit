<?php

namespace Database\Factories;

use App\Models\ComplaintTicket;
use App\Models\ComplaintTicketUpdate;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ComplaintTicketUpdate>
 */
class ComplaintTicketUpdateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'complaint_ticket_id' => ComplaintTicket::factory(),
            'user_id' => User::factory(),
            'status_from' => null,
            'status_to' => ComplaintTicket::STATUS_IN_PROGRESS,
            'note' => $this->faker->sentence(),
        ];
    }
}
