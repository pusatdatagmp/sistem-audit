<?php

use App\Http\Controllers\Inventory\InventoryLogController;
use App\Http\Controllers\Inventory\KitchenInventoryController;
use App\Http\Controllers\Inventory\KitchenToolController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'permission:inventory.manage'])->prefix('inventory')->name('inventory.')->group(function () {
    Route::get('/', [KitchenInventoryController::class, 'index'])->name('index');
    Route::post('/stock-in', [KitchenInventoryController::class, 'stockIn'])->name('stock-in');
    Route::post('/stock-out', [KitchenInventoryController::class, 'stockOut'])->name('stock-out');
    Route::post('/transfer', [KitchenInventoryController::class, 'transfer'])->name('transfer');
    Route::post('/opname', [KitchenInventoryController::class, 'opname'])->name('opname');

    Route::get('/logs', [InventoryLogController::class, 'index'])->name('logs');

    Route::resource('kitchen-tools', KitchenToolController::class)->except(['show']);
});
