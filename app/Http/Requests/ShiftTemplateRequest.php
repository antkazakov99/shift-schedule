<?php

namespace App\Http\Requests;

use App\Models\ShiftTemplate;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ShiftTemplateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:50'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'different:start_time'],
            'color' => ['sometimes', 'string', Rule::in(ShiftTemplate::COLORS)],
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'название',
            'start_time' => 'время начала',
            'end_time' => 'время окончания',
        ];
    }
}
