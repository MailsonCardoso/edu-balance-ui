<?php

namespace App\Http\Controllers;

use App\DTOs\WebhookNotificationDTO;
use App\Http\Requests\WebhookRequest;
use App\Services\MercadoPagoService;
use App\Services\PagamentoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MercadoPagoWebhookController extends Controller
{
    public function __construct(
        private readonly MercadoPagoService $mercadopago,
        private readonly PagamentoService $pagamentoService,
    ) {}

    public function __invoke(WebhookRequest $request): JsonResponse
    {
        $body = $request->getContent();
        $headers = $request->headers->all();
        $payload = $request->all();

        Log::info('Webhook: Requisicao recebida', [
            'headers' => $this->sanitizeHeaders($headers),
            'payload' => $payload,
        ]);

        $dto = WebhookNotificationDTO::fromRequest($payload);

        if (!$dto->isPaymentNotification()) {
            Log::info('Webhook: Notificacao ignorada (nao e pagamento)', [
                'topic' => $dto->topic,
            ]);
            return response()->json(['status' => 'ignored']);
        }

        $paymentId = $dto->getPaymentId();
        if (empty($paymentId)) {
            Log::warning('Webhook: payment_id vazio');
            return response()->json(['status' => 'ignored']);
        }

        if (config('services.mercadopago.webhook_secret')) {
            $isValid = $this->mercadopago->validarWebhook($headers, $body);
            if (!$isValid) {
                Log::warning('Webhook: Assinatura invalida', [
                    'payment_id' => $paymentId,
                ]);
                return response()->json(['status' => 'invalid_signature'], 401);
            }
        }

        try {
            $this->pagamentoService->processarNotificacaoWebhook(
                paymentId: $paymentId,
                payloadWebhook: $payload,
            );
        } catch (\Throwable $e) {
            Log::error('Webhook: Erro ao processar notificacao', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['status' => 'error'], 500);
        }

        Log::info('Webhook: Notificacao processada', ['payment_id' => $paymentId]);

        return response()->json(['status' => 'accepted']);
    }

    private function sanitizeHeaders(array $headers): array
    {
        $sanitized = [];
        foreach ($headers as $key => $value) {
            if (!str_contains(strtolower($key), 'authorization')) {
                $sanitized[$key] = $value;
            }
        }
        return $sanitized;
    }
}
