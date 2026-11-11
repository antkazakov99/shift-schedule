<?php

namespace Database\Factories;

use App\Models\ShiftTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ShiftTemplate>
 */
class ShiftTemplateFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->word(),
            'start_time' => '09:00',
            'end_time' => '18:00',
            'color' => fake()->randomElement(ShiftTemplate::COLORS),
            'sort_order' => 0,
        ];
    }
}
