<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Shift;
use App\Models\ShiftTemplate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScheduleApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_lists_employees_sorted_by_name(): void
    {
        Employee::factory()->create(['full_name' => 'Яковлев Яков']);
        Employee::factory()->create(['full_name' => 'Андреев Андрей']);

        $this->getJson('/api/employees')
            ->assertOk()
            ->assertJsonPath('data.0.full_name', 'Андреев Андрей')
            ->assertJsonPath('data.1.full_name', 'Яковлев Яков');
    }

    public function test_lists_shifts_in_period_only(): void
    {
        $employee = Employee::factory()->create();
        Shift::factory()->for($employee)->create(['date' => '2026-11-10']);
        Shift::factory()->for($employee)->create(['date' => '2026-11-20']);

        $this->getJson('/api/shifts?from=2026-11-09&to=2026-11-15')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.date', '2026-11-10')
            ->assertJsonPath('data.0.start_time', '09:00');
    }

    public function test_shift_period_is_validated(): void
    {
        $this->getJson('/api/shifts?from=2026-11-15&to=2026-11-01')->assertUnprocessable();
        $this->getJson('/api/shifts?from=2026-01-01&to=2026-12-31')->assertUnprocessable();
    }

    public function test_sync_creates_replaces_and_deletes_shifts(): void
    {
        $template = ShiftTemplate::factory()->create(['start_time' => '07:00', 'end_time' => '15:00']);
        [$a, $b] = Employee::factory()->count(2)->create();
        Shift::factory()->for($a)->create(['date' => '2026-11-10', 'start_time' => '09:00', 'end_time' => '18:00']);
        Shift::factory()->for($b)->create(['date' => '2026-11-10']);

        $this->putJson('/api/shifts', ['items' => [
            // replace existing
            ['employee_id' => $a->id, 'date' => '2026-11-10', 'shift' => [
                'start_time' => '07:00', 'end_time' => '15:00', 'shift_template_id' => $template->id,
            ]],
            // create new, overnight custom shift
            ['employee_id' => $a->id, 'date' => '2026-11-11', 'shift' => [
                'start_time' => '22:00', 'end_time' => '06:00', 'shift_template_id' => null,
            ]],
            // delete
            ['employee_id' => $b->id, 'date' => '2026-11-10', 'shift' => null],
        ]])
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->assertDatabaseCount('shifts', 2);
        $this->assertDatabaseHas('shifts', [
            'employee_id' => $a->id, 'date' => '2026-11-10', 'start_time' => '07:00', 'shift_template_id' => $template->id,
        ]);
        $this->assertDatabaseHas('shifts', ['employee_id' => $a->id, 'date' => '2026-11-11', 'end_time' => '06:00']);
        $this->assertDatabaseMissing('shifts', ['employee_id' => $b->id]);
    }

    public function test_sync_rejects_invalid_items_and_changes_nothing(): void
    {
        $employee = Employee::factory()->create();

        $this->putJson('/api/shifts', ['items' => [
            ['employee_id' => $employee->id, 'date' => '2026-11-10', 'shift' => ['start_time' => '09:00', 'end_time' => '18:00']],
            ['employee_id' => $employee->id, 'date' => '2026-11-11', 'shift' => ['start_time' => '25:00', 'end_time' => '18:00']],
            ['employee_id' => $employee->id, 'date' => '2026-11-12', 'shift' => ['start_time' => '10:00', 'end_time' => '10:00']],
            ['employee_id' => 999, 'date' => '2026-11-10', 'shift' => null],
        ]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['items.1.shift.start_time', 'items.2.shift.end_time', 'items.3.employee_id']);

        $this->assertDatabaseCount('shifts', 0);
    }

    public function test_sync_rejects_duplicate_cells(): void
    {
        $employee = Employee::factory()->create();
        $item = ['employee_id' => $employee->id, 'date' => '2026-11-10', 'shift' => null];

        $this->putJson('/api/shifts', ['items' => [$item, $item]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['items.1']);
    }

    public function test_template_crud_and_delete_keeps_shifts(): void
    {
        $id = $this->postJson('/api/shift-templates', ['name' => 'Ночь', 'start_time' => '23:00', 'end_time' => '07:00', 'color' => 'mint'])
            ->assertCreated()
            ->json('data.id');

        $this->putJson("/api/shift-templates/$id", ['name' => 'Ночная', 'start_time' => '22:00', 'end_time' => '06:00'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Ночная');

        $shift = Shift::factory()->create(['shift_template_id' => $id]);

        $this->deleteJson("/api/shift-templates/$id")->assertNoContent();
        $this->assertNull($shift->fresh()->shift_template_id);
        $this->getJson('/api/shift-templates')->assertJsonCount(0, 'data');
    }
}
