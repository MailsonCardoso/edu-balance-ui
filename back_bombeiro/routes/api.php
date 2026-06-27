<?php

use App\Http\Controllers\AlunoController;
use App\Http\Controllers\MensalidadeController;
use App\Http\Controllers\ResponsavelController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RevenueController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\FinancialCategoryController;
use App\Http\Controllers\CostCenterController;
use Illuminate\Support\Facades\Route;

// Rotas públicas
Route::get('/alunos/check-cpf/{cpf}', [AlunoController::class, 'checkCpf']);
Route::post('/responsavel/login', [ResponsavelController::class, 'login']);
Route::get('/noticias/publicas', [App\Http\Controllers\NoticiaController::class, 'publicas']);
Route::get('/ouvidoria', [App\Http\Controllers\OuvidoriaController::class, 'index']);
Route::post('/ouvidoria', [App\Http\Controllers\OuvidoriaController::class, 'store']);
Route::get('/ouvidoria/{protocolo}', [App\Http\Controllers\OuvidoriaController::class, 'show']);
Route::get('/transparencia', [App\Http\Controllers\TransparenciaController::class, 'index']);
Route::post('/associado', [App\Http\Controllers\AssociadoController::class, 'store']);
Route::post('/associado/login', [App\Http\Controllers\AssociadoController::class, 'login']);

// Auth
Route::post('/auth/login', [AuthController::class, 'login']);

// Rotas protegidas
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Dashboard
    Route::get('/dashboard/financeiro', [DashboardController::class, 'index']);

    // Alunos
    Route::apiResource('alunos', AlunoController::class);

    // Mensalidades
    Route::post('/mensalidades/verificar-vencidas', [MensalidadeController::class, 'verificarVencidas']);
    Route::apiResource('mensalidades', MensalidadeController::class);

    // Financeiro - Categorias
    Route::apiResource('financial-categories', FinancialCategoryController::class);

    // Financeiro - Centros de Custo
    Route::apiResource('cost-centers', CostCenterController::class);

    // Financeiro - Receitas
    Route::get('/revenues', [RevenueController::class, 'index']);
    Route::post('/revenues', [RevenueController::class, 'store']);
    Route::get('/revenues/{revenue}', [RevenueController::class, 'show']);
    Route::put('/revenues/{revenue}', [RevenueController::class, 'update']);
    Route::delete('/revenues/{revenue}', [RevenueController::class, 'destroy']);

    // Financeiro - Despesas
    Route::get('/expenses', [ExpenseController::class, 'index']);
    Route::post('/expenses', [ExpenseController::class, 'store']);
    Route::get('/expenses/{expense}', [ExpenseController::class, 'show']);
    Route::put('/expenses/{expense}', [ExpenseController::class, 'update']);
    Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy']);
    Route::put('/expenses/{expense}/pagar', [ExpenseController::class, 'pagar']);
    Route::put('/expenses/{expense}/estornar', [ExpenseController::class, 'estornar']);

    // Outros
    Route::apiResource('noticias', App\Http\Controllers\NoticiaController::class);
    Route::apiResource('categorias', App\Http\Controllers\CategoriaController::class)->except(['show']);
    Route::put('/ouvidoria/{ouvidoria}', [App\Http\Controllers\OuvidoriaController::class, 'update']);
    Route::post('/documentos/chunks', [App\Http\Controllers\DocumentoController::class, 'chunks']);
    Route::get('/documentos', [App\Http\Controllers\DocumentoController::class, 'index']);
    Route::post('/documentos', [App\Http\Controllers\DocumentoController::class, 'store']);
    Route::post('/documentos/{documento}', [App\Http\Controllers\DocumentoController::class, 'update']);
    Route::delete('/documentos/{documento}', [App\Http\Controllers\DocumentoController::class, 'destroy']);
    Route::get('/associado', [App\Http\Controllers\AssociadoController::class, 'show']);
    Route::put('/associado', [App\Http\Controllers\AssociadoController::class, 'update']);
    Route::get('/associado/mensalidades', [App\Http\Controllers\AssociadoController::class, 'mensalidades']);
});
