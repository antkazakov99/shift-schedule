<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Shift;
use App\Models\ShiftTemplate;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $templates = collect([
            ['name' => 'Утро', 'start_time' => '07:00', 'end_time' => '15:00', 'color' => 'cornflower'],
            ['name' => 'День', 'start_time' => '10:00', 'end_time' => '18:00', 'color' => 'lavanda'],
            ['name' => 'Вечер', 'start_time' => '15:00', 'end_time' => '23:00', 'color' => 'mint'],
        ])->map(fn (array $data, int $i) => ShiftTemplate::create($data + ['sort_order' => $i]));

        // Same people as in the layouts.
        $employees = collect([
            'Кузнецова Алина', 'Волков Тимур', 'Морозова Виктория', 'Соколов Артём', 'Лебедева Полина',
            'Новиков Кирилл', 'Ерохина Дарья', 'Гаврилов Егор', 'Петрова Ксения', 'Захаров Максим',
        ])->map(fn (string $name) => Employee::create(['full_name' => $name, 'position' => 'агент']));

        // A few shifts in the current week (Mon–Fri) so the calendar is not empty on first open.
        // Weekend columns stay empty to show the "no coverage" state.
        $monday = Carbon::now()->startOfWeek();
        foreach ($employees->take(6)->values() as $i => $employee) {
            foreach (range(0, 4) as $day) {
                if (($i + $day) % 3 === 0) {
                    continue;
                }
                $template = $templates[($i + $day) % 3];
                Shift::create([
                    'employee_id' => $employee->id,
                    'shift_template_id' => $template->id,
                    'date' => $monday->copy()->addDays($day)->toDateString(),
                    'start_time' => $template->start_time,
                    'end_time' => $template->end_time,
                ]);
            }
        }
    }
}
