<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('mensalidades:gerar-proximo-mes')
    ->monthlyOn(26, '00:00')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/mensalidades.log'));
