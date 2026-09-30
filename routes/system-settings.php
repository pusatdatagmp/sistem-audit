<?php

use App\Http\Controllers\Settings\SystemSettingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'permission:settings.manage'])->prefix('system-settings')->name('system-settings.')->group(function () {
    Route::get('/', [SystemSettingController::class, 'edit'])->name('edit');
    Route::post('/', [SystemSettingController::class, 'update'])->name('update');
});
