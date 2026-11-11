<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Shift extends Model
{
    use HasFactory;

    /**
     * `date` is intentionally kept as a plain "Y-m-d" string (no date cast): the cast would store
     * "Y-m-d H:i:s", which breaks exact lookups by (employee_id, date) on SQLite.
     */
    protected $fillable = ['employee_id', 'shift_template_id', 'date', 'start_time', 'end_time'];

    protected function casts(): array
    {
        return [
            'employee_id' => 'integer',
            'shift_template_id' => 'integer',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(ShiftTemplate::class, 'shift_template_id');
    }
}
