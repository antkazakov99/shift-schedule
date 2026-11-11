<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ShiftIndexRequest;
use App\Http\Requests\SyncShiftsRequest;
use App\Http\Resources\ShiftResource;
use App\Services\ShiftScheduleService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ShiftController extends Controller
{
    public function __construct(private readonly ShiftScheduleService $schedule) {}

    public function index(ShiftIndexRequest $request): AnonymousResourceCollection
    {
        return ShiftResource::collection(
            $this->schedule->forPeriod($request->validated('from'), $request->validated('to'))
        );
    }

    public function sync(SyncShiftsRequest $request): AnonymousResourceCollection
    {
        return ShiftResource::collection($this->schedule->sync($request->items()));
    }
}
