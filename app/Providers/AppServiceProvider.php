<?php

namespace App\Providers;

use App\Models\ComplaintTicket;
use App\Models\EquipmentRequest;
use App\Observers\ComplaintTicketObserver;
use App\Observers\EquipmentRequestObserver;
use Illuminate\Auth\Middleware\RedirectIfAuthenticated;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RedirectIfAuthenticated::redirectUsing(function ($request) {
            return route($request->user()?->homeRouteName() ?? 'login');
        });

        ComplaintTicket::observe(ComplaintTicketObserver::class);
        EquipmentRequest::observe(EquipmentRequestObserver::class);
    }
}
