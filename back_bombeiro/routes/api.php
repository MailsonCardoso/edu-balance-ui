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
Route::get('/ouvidoria', [App\Http\Controllers\OuvidoriaController::class, 'index']);
Route::post('/ouvidoria', [App\Http\Controllers\OuvidoriaController::class, 'store']);

Route::post('/associado', [App\Http\Controllers\AssociadoController::class, 'store']);
Route::post('/associado/login', [App\Http\Controllers\AssociadoController::class, 'login']);
Route::get('/associado', [App\Http\Controllers\AssociadoController::class, 'show']);
Route::put('/associado', [App\Http\Controllers\AssociadoController::class, 'update']);
