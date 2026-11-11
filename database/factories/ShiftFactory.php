<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\Shift;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Shift>
 */
class ShiftFactory extends Factory
{
    public function definition(): array
    {
        return [
            'employee_id' => Employee::factory(),
            'shift_template_id' => null,
            'date' => fake()->unique()->dateTimeBetween('-1 month', '+1 month')->format('Y-m-d'),
            'start_time' => '09:00',
            'end_time' => '18:00',
        ];
    }
}
