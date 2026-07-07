<?php

namespace App\Jobs;

use App\Services\PagamentoService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProcessMercadoPagoWebhookJob implements ShouldQueue
{
    use Queueable;

    private string $paymentId;
    private array $payloadWebhook;

    public function __construct(string $paymentId, array $payloadWebhook)
    {
        $this->paymentId = $paymentId;
        $this->payloadWebhook = $payloadWebhook;
    }

    public function handle(PagamentoService $pagamentoService): void
    {
        Log::info('Job: Processando webhook Mercado Pago', [
            'payment_id' => $this->paymentId,
        ]);

        try {
            $pagamentoService->processarNotificacaoWebhook(
                paymentId: $this->paymentId,
                payloadWebhook: $this->payloadWebhook,
            );
        } catch (\Throwable $e) {
            Log::error('Job: Erro ao processar webhook', [
                'payment_id' => $this->paymentId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    public function tags(): array
    {
        return ['webhook', 'mercadopago', "payment:{$this->paymentId}"];
    }
}
