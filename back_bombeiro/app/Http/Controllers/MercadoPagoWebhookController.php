<?php

namespace App\Http\Controllers;

use App\DTOs\WebhookNotificationDTO;
use App\Http\Requests\WebhookRequest;
use App\Jobs\ProcessMercadoPagoWebhookJob;
use App\Services\MercadoPagoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MercadoPagoWebhookController extends Controller
{
    public function __construct(
        private readonly MercadoPagoService $mercadopago,
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

        ProcessMercadoPagoWebhookJob::dispatch($paymentId, $payload);

        Log::info('Webhook: Job dispatchado', ['payment_id' => $paymentId]);

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
