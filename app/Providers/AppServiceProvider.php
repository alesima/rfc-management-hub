<?php

namespace App\Providers;

use App\Models\Rfc;
use App\Models\Team;
use App\Policies\RfcPolicy;
use App\Policies\TeamPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
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
        Vite::prefetch(concurrency: 3);
        Gate::policy(Rfc::class, RfcPolicy::class);
        Gate::policy(Team::class, TeamPolicy::class);
    }
}
