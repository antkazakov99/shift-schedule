<?php

namespace App\Services;

use App\Models\Shift;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ShiftScheduleService
{
    /**
     * @return Collection<int, Shift>
     */
    public function forPeriod(string $from, string $to): Collection
    {
        return Shift::query()
            ->whereBetween('date', [$from, $to])
            ->orderBy('date')
            ->orderBy('employee_id')
            ->get();
    }

    /**
     * Apply a batch of cell changes atomically.
     *
     * @param  list<array{employee_id:int, date:string, shift:array{start_time:string, end_time:string, shift_template_id:?int}|null}>  $items
     * @return Collection<int, Shift> shifts that exist after the sync in the touched cells
     */
    public function sync(array $items): Collection
    {
        return DB::transaction(function () use ($items) {
            $saved = collect();

            foreach ($items as $item) {
                $cell = ['employee_id' => $item['employee_id'], 'date' => $item['date']];

                if ($item['shift'] === null) {
                    Shift::query()->where($cell)->delete();

                    continue;
                }

                $saved->push(Shift::query()->updateOrCreate($cell, $item['shift']));
            }

            return $saved;
        });
    }
}
