<?php

use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\ShiftController;
use App\Http\Controllers\Api\ShiftTemplateController;
use Illuminate\Support\Facades\Route;

Route::get('employees', [EmployeeController::class, 'index']);

Route::apiResource('shift-templates', ShiftTemplateController::class)->except('show');

Route::get('shifts', [ShiftController::class, 'index']);
Route::put('shifts', [ShiftController::class, 'sync']);
