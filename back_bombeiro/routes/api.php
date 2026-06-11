<?php

use App\Http\Controllers\AlunoController;
use App\Http\Controllers\MensalidadeController;
use Illuminate\Support\Facades\Route;

Route::get('/alunos/check-cpf/{cpf}', [AlunoController::class, 'checkCpf']);
Route::apiResource('alunos', AlunoController::class);
Route::apiResource('mensalidades', MensalidadeController::class);
