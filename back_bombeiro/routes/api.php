<?php

use App\Http\Controllers\AlunoController;
use App\Http\Controllers\MensalidadeController;
use App\Http\Controllers\ResponsavelController;
use Illuminate\Support\Facades\Route;

Route::get('/alunos/check-cpf/{cpf}', [AlunoController::class, 'checkCpf']);
Route::apiResource('alunos', AlunoController::class);
Route::post('/mensalidades/verificar-vencidas', [MensalidadeController::class, 'verificarVencidas']);
Route::apiResource('mensalidades', MensalidadeController::class);
Route::post('/responsavel/login', [ResponsavelController::class, 'login']);
