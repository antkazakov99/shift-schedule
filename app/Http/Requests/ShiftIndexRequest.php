<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ShiftIndexRequest extends FormRequest
{
    /** Max period length in days, enough for a month view with margins. */
    private const MAX_RANGE_DAYS = 62;

    public function rules(): array
    {
        return [
            'from' => ['required', 'date_format:Y-m-d'],
            'to' => ['required', 'date_format:Y-m-d', 'after_or_equal:from'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }
                $days = $this->date('from')->diffInDays($this->date('to'));
                if ($days > self::MAX_RANGE_DAYS) {
                    $validator->errors()->add('to', 'Период не может быть длиннее '.self::MAX_RANGE_DAYS.' дней.');
                }
            },
        ];
    }
}
