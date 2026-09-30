<?php

use App\Http\Controllers\Ticket\TicketController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'permission:tickets.manage'])->prefix('tickets')->name('tickets.')->group(function () {
    Route::get('/', [TicketController::class, 'index'])->name('index');
    Route::get('/create', [TicketController::class, 'create'])->name('create');
    Route::post('/', [TicketController::class, 'store'])->name('store');
    Route::get('/{ticket}', [TicketController::class, 'show'])->name('show');
    Route::get('/{ticket}/edit', [TicketController::class, 'edit'])->name('edit');
    Route::put('/{ticket}', [TicketController::class, 'update'])->name('update');
    Route::post('/{ticket}/status', [TicketController::class, 'updateStatus'])->name('update-status');
});
