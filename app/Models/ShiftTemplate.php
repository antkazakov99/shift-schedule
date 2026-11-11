<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShiftTemplate extends Model
{
    use HasFactory;

    public const COLORS = ['cornflower', 'lavanda', 'mint'];

    protected $fillable = ['name', 'start_time', 'end_time', 'color', 'sort_order'];

    public function shifts(): HasMany
    {
        return $this->hasMany(Shift::class);
    }
}
