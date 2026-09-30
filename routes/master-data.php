<?php

use App\Http\Controllers\MasterData\KitchenController;
use App\Http\Controllers\MasterData\MasterDataGroupController;
use App\Http\Controllers\MasterData\MasterDataOptionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'permission:master-data.manage'])->prefix('master-data')->name('master-data.')->group(function () {
    Route::resource('kitchens', KitchenController::class)->except(['show']);

    Route::get('option-groups', [MasterDataGroupController::class, 'index'])->name('option-groups.index');
    Route::post('option-groups', [MasterDataGroupController::class, 'store'])->name('option-groups.store');
    Route::get('option-groups/{group:code}', [MasterDataGroupController::class, 'show'])->name('option-groups.show');
    Route::delete('option-groups/{group:code}', [MasterDataGroupController::class, 'destroy'])->name('option-groups.destroy');

    Route::post('option-groups/{group:code}/options', [MasterDataOptionController::class, 'store'])->name('options.store');
    Route::put('options/{option}', [MasterDataOptionController::class, 'update'])->name('options.update');
    Route::delete('options/{option}', [MasterDataOptionController::class, 'destroy'])->name('options.destroy');
});
