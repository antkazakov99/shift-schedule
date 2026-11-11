<?php

namespace App\Http\Resources;

use App\Models\Shift;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Shift
 */
class ShiftResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'shift_template_id' => $this->shift_template_id,
            'date' => substr((string) $this->date, 0, 10),
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
        ];
    }
}
