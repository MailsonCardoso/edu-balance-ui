<?php

namespace App\Providers;

use App\Events\MensalidadeStatusUpdated;
use App\Listeners\LogMensalidadeStatusUpdate;
use Illuminate\Database\Schema\Builder;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(\App\Services\MercadoPagoService::class);
        $this->app->singleton(\App\Services\PagamentoService::class);
    }

    public function boot(): void
    {
        Builder::defaultStringLength(191);

        Event::listen(
            MensalidadeStatusUpdated::class,
            LogMensalidadeStatusUpdate::class,
        );
    }
}
