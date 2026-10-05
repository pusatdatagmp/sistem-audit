<?php

use App\Http\Controllers\Inventory\EquipmentRequestController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'permission:equipment-requests.manage'])->prefix('equipment-requests')->name('equipment-requests.')->group(function () {
    Route::get('/', [EquipmentRequestController::class, 'index'])->name('index');
    Route::get('/create', [EquipmentRequestController::class, 'create'])->name('create');
    Route::post('/', [EquipmentRequestController::class, 'store'])->name('store');
    Route::post('/{equipmentRequest}/status', [EquipmentRequestController::class, 'updateStatus'])->name('update-status');
});
