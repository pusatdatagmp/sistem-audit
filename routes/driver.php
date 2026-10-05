<?php

use App\Http\Controllers\Driver\DriverInspectionController;
use App\Http\Controllers\Driver\DriverUsageLogController;
use App\Http\Controllers\Driver\EquipmentRequestController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'permission:driver-portal.access'])->prefix('driver')->name('driver.')->group(function () {
    Route::get('/', [DriverUsageLogController::class, 'index'])->name('index');
    Route::get('/buat', [DriverUsageLogController::class, 'create'])->name('create');
    Route::post('/', [DriverUsageLogController::class, 'store'])->name('store');
    Route::get('/{usageLog}/ubah', [DriverUsageLogController::class, 'edit'])->name('edit');
    Route::put('/{usageLog}', [DriverUsageLogController::class, 'update'])->name('update');

    Route::prefix('inspeksi')->name('inspections.')->group(function () {
        Route::get('/', [DriverInspectionController::class, 'index'])->name('index');
        Route::get('/buat', [DriverInspectionController::class, 'create'])->name('create');
        Route::post('/', [DriverInspectionController::class, 'store'])->name('store');
        Route::get('/{inspection}', [DriverInspectionController::class, 'show'])->name('show');
    });

    Route::prefix('pengajuan')->name('equipment-requests.')->group(function () {
        Route::get('/', [EquipmentRequestController::class, 'index'])->name('index');
        Route::get('/buat', [EquipmentRequestController::class, 'create'])->name('create');
        Route::post('/', [EquipmentRequestController::class, 'store'])->name('store');
    });
});
