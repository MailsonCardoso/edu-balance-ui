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
Route::get('/noticias/publicas', [App\Http\Controllers\NoticiaController::class, 'publicas']);
Route::apiResource('noticias', App\Http\Controllers\NoticiaController::class);

Route::apiResource('categorias', App\Http\Controllers\CategoriaController::class)->except(['show']);

Route::get('/ouvidoria', [App\Http\Controllers\OuvidoriaController::class, 'index']);
Route::post('/ouvidoria', [App\Http\Controllers\OuvidoriaController::class, 'store']);
Route::get('/ouvidoria/{protocolo}', [App\Http\Controllers\OuvidoriaController::class, 'show']);
Route::put('/ouvidoria/{ouvidoria}', [App\Http\Controllers\OuvidoriaController::class, 'update']);

Route::get('/transparencia', [App\Http\Controllers\TransparenciaController::class, 'index']);

Route::post('/documentos/chunks', [App\Http\Controllers\DocumentoController::class, 'chunks']);
Route::get('/documentos', [App\Http\Controllers\DocumentoController::class, 'index']);
Route::post('/documentos', [App\Http\Controllers\DocumentoController::class, 'store']);
Route::post('/documentos/{documento}', [App\Http\Controllers\DocumentoController::class, 'update']);
Route::delete('/documentos/{documento}', [App\Http\Controllers\DocumentoController::class, 'destroy']);

Route::post('/associado', [App\Http\Controllers\AssociadoController::class, 'store']);
Route::post('/associado/login', [App\Http\Controllers\AssociadoController::class, 'login']);
Route::get('/associado', [App\Http\Controllers\AssociadoController::class, 'show']);
Route::put('/associado', [App\Http\Controllers\AssociadoController::class, 'update']);
Route::get('/associado/mensalidades', [App\Http\Controllers\AssociadoController::class, 'mensalidades']);
