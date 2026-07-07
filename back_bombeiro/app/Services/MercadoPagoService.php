<?php

namespace App\Services;

use App\DTOs\GerarCobrancaDTO;
use App\Models\PagamentoTransacao;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MercadoPagoService
{
    private string $accessToken;
    private string $baseUrl;

    public function __construct()
    {
        $this->accessToken = config('services.mercadopago.access_token', '');
        $isSandbox = config('services.mercadopago.sandbox', true);
        $this->baseUrl = $isSandbox
            ? 'https://api.mercadopago.com/sandbox/v1'
            : 'https://api.mercadopago.com/v1';
    }

    private function headers(): array
    {
        return [
            'Authorization' => 'Bearer ' . $this->accessToken,
            'Content-Type' => 'application/json',
            'X-Idempotency-Key' => uniqid('mp_', true),
        ];
    }

    public function criarCobranca(GerarCobrancaDTO $dto): array
    {
        $payload = [
            'external_reference' => $dto->externalReference,
            'notification_url' => $dto->notificationUrl,
            'statement_descriptor' => 'ESCOLA BOMBEIRO',
            'description' => $dto->titulo,
            'date_of_expiration' => $this->formatExpiration($dto->vencimento),
            'payer' => [
                'email' => $dto->emailPagador,
                'first_name' => $dto->nomePagador,
                'identification' => [
                    'type' => 'CPF',
                    'number' => $dto->cpfPagador,
                ],
            ],
            'payment_methods' => [
                'excluded_payment_types' => [
                    ['id' => 'credit_card'],
                    ['id' => 'debit_card'],
                    ['id' => 'ticket'],
                ],
                'installments' => 1,
            ],
            'items' => [
                [
                    'id' => (string) $dto->mensalidadeId,
                    'title' => $dto->titulo,
                    'description' => $dto->titulo,
                    'quantity' => 1,
                    'unit_price' => $dto->valor,
                    'currency_id' => 'BRL',
                ],
            ],
        ];

        Log::info('MercadoPago: Criando cobranca', [
            'external_reference' => $dto->externalReference,
            'mensalidade_id' => $dto->mensalidadeId,
            'valor' => $dto->valor,
        ]);

        $response = Http::withHeaders($this->headers())
            ->post("{$this->baseUrl}/payments", $payload);

        $this->logResponse('criar_cobranca', $response, $dto->externalReference);

        if (!$response->successful()) {
            Log::error('MercadoPago: Erro ao criar cobranca', [
                'status' => $response->status(),
                'body' => $response->body(),
                'external_reference' => $dto->externalReference,
            ]);
            throw new \RuntimeException(
                'Erro ao criar cobrança no Mercado Pago: ' . ($response->json()['message'] ?? $response->body())
            );
        }

        return $response->json();
    }

    public function consultarPagamento(string $paymentId): array
    {
        Log::info('MercadoPago: Consultando pagamento', ['payment_id' => $paymentId]);

        $response = Http::withHeaders($this->headers())
            ->get("{$this->baseUrl}/payments/{$paymentId}");

        $this->logResponse('consultar_pagamento', $response, $paymentId);

        if (!$response->successful()) {
            Log::error('MercadoPago: Erro ao consultar pagamento', [
                'payment_id' => $paymentId,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \RuntimeException(
                'Erro ao consultar pagamento no Mercado Pago: ' . ($response->json()['message'] ?? $response->body())
            );
        }

        return $response->json();
    }

    public function criarPreference(GerarCobrancaDTO $dto): array
    {
        $payload = [
            'external_reference' => $dto->externalReference,
            'notification_url' => $dto->notificationUrl,
            'statement_descriptor' => 'ESCOLA BOMBEIRO',
            'payer' => [
                'email' => $dto->emailPagador,
                'name' => $dto->nomePagador,
                'identification' => [
                    'type' => 'CPF',
                    'number' => $dto->cpfPagador,
                ],
            ],
            'payment_methods' => [
                'excluded_payment_types' => [
                    ['id' => 'credit_card'],
                    ['id' => 'debit_card'],
                ],
                'installments' => 1,
            ],
            'items' => [
                [
                    'id' => (string) $dto->mensalidadeId,
                    'title' => $dto->titulo,
                    'description' => $dto->titulo,
                    'quantity' => 1,
                    'unit_price' => $dto->valor,
                    'currency_id' => 'BRL',
                ],
            ],
            'back_urls' => [
                'success' => 'https://api5.platformx.com.br/associado/painel?tab=pagamentos',
                'failure' => 'https://api5.platformx.com.br/associado/painel?tab=pagamentos',
                'pending' => 'https://api5.platformx.com.br/associado/painel?tab=pagamentos',
            ],
        ];

        Log::info('MercadoPago: Criando preferencia', [
            'external_reference' => $dto->externalReference,
            'mensalidade_id' => $dto->mensalidadeId,
        ]);

        $response = Http::withHeaders($this->headers())
            ->post('https://api.mercadopago.com/checkout/preferences', $payload);

        $this->logResponse('criar_preference', $response, $dto->externalReference);

        if (!$response->successful()) {
            Log::error('MercadoPago: Erro ao criar preferencia', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \RuntimeException(
                'Erro ao criar preferência no Mercado Pago: ' . ($response->json()['message'] ?? $response->body())
            );
        }

        return $response->json();
    }

    public function validarWebhook(array $headers, string $body): bool
    {
        $secret = config('services.mercadopago.webhook_secret');
        if (empty($secret)) {
            return false;
        }

        $signature = $headers['x-signature'] ?? $headers['X-Signature'] ?? '';
        if (empty($signature)) {
            Log::warning('MercadoPago: Webhook sem assinatura');
            return false;
        }

        $generated = hash_hmac('sha256', $body, $secret);
        $isValid = hash_equals($generated, $signature);

        if (!$isValid) {
            Log::warning('MercadoPago: Assinatura do webhook invalida');
        }

        return $isValid;
    }

    private function formatExpiration(string $vencimento): string
    {
        $date = \Carbon\Carbon::createFromFormat('Y-m-d', $vencimento);
        return $date->endOfDay()->utc()->format('Y-m-d\TH:i:s.u\Z');
    }

    private function logResponse(string $acao, Response $response, string $referencia): void
    {
        Log::info("MercadoPago: Resposta {$acao}", [
            'referencia' => $referencia,
            'status' => $response->status(),
            'body' => $response->json(),
        ]);
    }
}
