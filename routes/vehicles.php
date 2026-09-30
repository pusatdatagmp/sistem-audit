<?php

use App\Http\Controllers\Vehicle\VehicleController;
use App\Http\Controllers\Vehicle\VehicleInspectionController;
use App\Http\Controllers\Vehicle\VehicleMaintenanceScheduleController;
use App\Http\Controllers\Vehicle\VehicleUsageLogController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'permission:vehicles.manage'])->group(function () {
    Route::resource('vehicles', VehicleController::class)->except(['show']);

    Route::prefix('vehicles')->name('vehicles.')->group(function () {
        Route::get('maintenance', [VehicleMaintenanceScheduleController::class, 'index'])->name('maintenance.index');
        Route::get('maintenance/create', [VehicleMaintenanceScheduleController::class, 'create'])->name('maintenance.create');
        Route::post('maintenance', [VehicleMaintenanceScheduleController::class, 'store'])->name('maintenance.store');
        Route::get('maintenance/{maintenanceSchedule}/edit', [VehicleMaintenanceScheduleController::class, 'edit'])->name('maintenance.edit');
        Route::put('maintenance/{maintenanceSchedule}', [VehicleMaintenanceScheduleController::class, 'update'])->name('maintenance.update');
        Route::post('maintenance/{maintenanceSchedule}/complete', [VehicleMaintenanceScheduleController::class, 'complete'])
            ->name('maintenance.complete');
        Route::delete('maintenance/{maintenanceSchedule}', [VehicleMaintenanceScheduleController::class, 'destroy'])->name('maintenance.destroy');

        Route::get('usage-logs', [VehicleUsageLogController::class, 'index'])->name('usage-logs.index');
        Route::get('usage-logs/create', [VehicleUsageLogController::class, 'create'])->name('usage-logs.create');
        Route::post('usage-logs', [VehicleUsageLogController::class, 'store'])->name('usage-logs.store');
        Route::get('usage-logs/{usageLog}/edit', [VehicleUsageLogController::class, 'edit'])->name('usage-logs.edit');
        Route::put('usage-logs/{usageLog}', [VehicleUsageLogController::class, 'update'])->name('usage-logs.update');
        Route::delete('usage-logs/{usageLog}', [VehicleUsageLogController::class, 'destroy'])->name('usage-logs.destroy');

        Route::get('inspections', [VehicleInspectionController::class, 'index'])->name('inspections.index');
        Route::get('inspections/create', [VehicleInspectionController::class, 'create'])->name('inspections.create');
        Route::post('inspections', [VehicleInspectionController::class, 'store'])->name('inspections.store');
        Route::get('inspections/{inspection}', [VehicleInspectionController::class, 'show'])->name('inspections.show');
        Route::delete('inspections/{inspection}', [VehicleInspectionController::class, 'destroy'])->name('inspections.destroy');
    });
});
