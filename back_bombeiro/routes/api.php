<?php

use App\Http\Controllers\AlunoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CobrancaController;
use App\Http\Controllers\MensalidadeController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\FinancialCategoryController;
use App\Http\Controllers\MercadoPagoWebhookController;
use App\Http\Controllers\PatrimonioController;
use App\Http\Controllers\RevenueController;
use Illuminate\Support\Facades\Route;

// Rotas públicas
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/alunos/check-cpf/{cpf}', [AlunoController::class, 'checkCpf']);
Route::get('/noticias/publicas', [App\Http\Controllers\NoticiaController::class, 'publicas']);
Route::get('/ouvidoria', [App\Http\Controllers\OuvidoriaController::class, 'index']);
Route::post('/ouvidoria', [App\Http\Controllers\OuvidoriaController::class, 'store']);
Route::get('/ouvidoria/{protocolo}', [App\Http\Controllers\OuvidoriaController::class, 'show']);
Route::get('/transparencia', [App\Http\Controllers\TransparenciaController::class, 'index']);
Route::post('/documentos/chunks', [App\Http\Controllers\DocumentoController::class, 'chunks']);
Route::get('/documentos', [App\Http\Controllers\DocumentoController::class, 'index']);
Route::post('/associado', [App\Http\Controllers\AssociadoController::class, 'store']);
Route::post('/associado/login', [App\Http\Controllers\AssociadoController::class, 'login']);
Route::get('/associado', [App\Http\Controllers\AssociadoController::class, 'show']);
Route::put('/associado', [App\Http\Controllers\AssociadoController::class, 'update']);
Route::get('/associado/mensalidades', [App\Http\Controllers\AssociadoController::class, 'mensalidades']);

// Webhook Mercado Pago (público)
Route::post('/webhooks/mercadopago', MercadoPagoWebhookController::class);

// Cobrança Mercado Pago (usando token do associado)
Route::post('/mensalidades/{mensalidade}/gerar-cobranca', [CobrancaController::class, 'gerar']);
Route::get('/mensalidades/{mensalidade}/status-pagamento', [CobrancaController::class, 'status']);

// Rotas protegidas
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard/financeiro', [App\Http\Controllers\DashboardController::class, 'financeiro']);
    Route::apiResource('alunos', AlunoController::class);
    Route::get('/alunos/{aluno}/extrato', [AlunoController::class, 'extrato']);
    Route::post('/mensalidades/verificar-vencidas', [MensalidadeController::class, 'verificarVencidas']);
    Route::apiResource('mensalidades', MensalidadeController::class);
    Route::apiResource('financial-categories', FinancialCategoryController::class)->except(['show']);
    Route::apiResource('revenues', RevenueController::class);
    Route::apiResource('expenses', ExpenseController::class);
    Route::apiResource('patrimonios', PatrimonioController::class);

    Route::apiResource('noticias', App\Http\Controllers\NoticiaController::class);
    Route::apiResource('categorias', App\Http\Controllers\CategoriaController::class)->except(['show']);
    Route::put('/ouvidoria/{ouvidoria}', [App\Http\Controllers\OuvidoriaController::class, 'update']);
    Route::post('/documentos', [App\Http\Controllers\DocumentoController::class, 'store']);
    Route::post('/documentos/{documento}', [App\Http\Controllers\DocumentoController::class, 'update']);
    Route::delete('/documentos/{documento}', [App\Http\Controllers\DocumentoController::class, 'destroy']);
    Route::get('/associados', [App\Http\Controllers\AssociadoController::class, 'listAll']);
    Route::delete('/associados/{id}', [App\Http\Controllers\AssociadoController::class, 'destroy']);
});
