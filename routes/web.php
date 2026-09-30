<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'permission:dashboard.view'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/inventory.php';
require __DIR__.'/master-data.php';
require __DIR__.'/vehicles.php';
require __DIR__.'/tickets.php';
require __DIR__.'/portal.php';
require __DIR__.'/users.php';
require __DIR__.'/roles.php';
require __DIR__.'/driver.php';
require __DIR__.'/system-settings.php';
