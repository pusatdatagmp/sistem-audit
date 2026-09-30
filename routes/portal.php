<?php

use App\Http\Controllers\Portal\PortalTicketController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('lapor')->name('portal.')->group(function () {
    Route::get('/', [PortalTicketController::class, 'index'])->name('index');
    Route::get('/buat', [PortalTicketController::class, 'create'])->name('create');
    Route::post('/', [PortalTicketController::class, 'store'])->name('store');
    Route::get('/{ticket}', [PortalTicketController::class, 'show'])->name('show');
});
