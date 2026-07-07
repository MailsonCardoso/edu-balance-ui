<?php

namespace App\Http\Controllers;

use App\Http\Requests\GerarCobrancaRequest;
use App\Models\Mensalidade;
use App\Services\PagamentoService;
use Illuminate\Http\JsonResponse;

class CobrancaController extends Controller
{
    public function __construct(
        private readonly PagamentoService $pagamentoService,
    ) {}

    public function gerar(Mensalidade $mensalidade, GerarCobrancaRequest $request): JsonResponse
    {
        try {
            $transacao = $this->pagamentoService->gerarCobranca($mensalidade);

            $payloadRequest = $transacao->payload_request ?? [];

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $transacao->id,
                    'payment_url' => $transacao->payment_url,
                    'external_reference' => $transacao->external_reference,
                    'status' => $transacao->status,
                    'pix_qr_code' => $payloadRequest['point_of_interaction']['transaction_data']['qr_code'] ?? null,
                    'pix_qr_code_base64' => $payloadRequest['point_of_interaction']['transaction_data']['qr_code_base64'] ?? null,
                ],
                'message' => 'Cobrança gerada com sucesso.',
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro interno ao gerar cobrança.',
            ], 500);
        }
    }

    public function status(Mensalidade $mensalidade): JsonResponse
    {
        $transacao = $mensalidade->ultimaTransacao;

        return response()->json([
            'success' => true,
            'data' => [
                'mensalidade_id' => $mensalidade->id,
                'status' => $mensalidade->status,
                'data_pagamento' => $mensalidade->data_pagamento?->format('d/m/Y'),
                'forma_pagamento' => $mensalidade->forma_pagamento,
                'origem' => $mensalidade->origem,
                'transacao' => $transacao ? [
                    'id' => $transacao->id,
                    'payment_id' => $transacao->payment_id,
                    'preference_id' => $transacao->preference_id,
                    'external_reference' => $transacao->external_reference,
                    'status' => $transacao->status,
                    'payment_method' => $transacao->payment_method,
                    'payment_url' => $transacao->payment_url,
                ] : null,
            ],
        ]);
    }
}
