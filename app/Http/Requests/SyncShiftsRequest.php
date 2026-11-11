<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/**
 * Batch save of calendar cells. Each item addresses one cell (employee × date):
 * `shift` with times creates/replaces the shift, `shift: null` clears the cell.
 */
class SyncShiftsRequest extends FormRequest
{
    private const MAX_ITEMS = 2000;

    public function rules(): array
    {
        return [
            'items' => ['present', 'array', 'max:'.self::MAX_ITEMS],
            'items.*.employee_id' => ['required', 'integer', 'exists:employees,id'],
            'items.*.date' => ['required', 'date_format:Y-m-d'],
            'items.*.shift' => ['present', 'nullable', 'array'],
            'items.*.shift.start_time' => ['required_with:items.*.shift', 'date_format:H:i'],
            'items.*.shift.end_time' => ['required_with:items.*.shift', 'date_format:H:i', 'different:items.*.shift.start_time'],
            'items.*.shift.shift_template_id' => ['nullable', 'integer', 'exists:shift_templates,id'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $seen = [];
                foreach ($this->input('items', []) as $i => $item) {
                    $key = ($item['employee_id'] ?? '').'|'.($item['date'] ?? '');
                    if (isset($seen[$key])) {
                        $validator->errors()->add("items.$i", 'Ячейка указана несколько раз.');
                    }
                    $seen[$key] = true;
                }
            },
        ];
    }

    /**
     * @return list<array{employee_id:int, date:string, shift:array{start_time:string, end_time:string, shift_template_id:?int}|null}>
     */
    public function items(): array
    {
        return array_map(fn (array $item) => [
            'employee_id' => (int) $item['employee_id'],
            'date' => $item['date'],
            'shift' => $item['shift'] === null ? null : [
                'start_time' => $item['shift']['start_time'],
                'end_time' => $item['shift']['end_time'],
                'shift_template_id' => $item['shift']['shift_template_id'] ?? null,
            ],
        ], $this->validated('items'));
    }
}
