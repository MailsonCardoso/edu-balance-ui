<?php

namespace App\Listeners;

use App\Events\MensalidadeStatusUpdated;
use App\Models\PagamentoHistorico;
use Illuminate\Support\Facades\Log;

class LogMensalidadeStatusUpdate
{
    public function handle(MensalidadeStatusUpdated $event): void
    {
        try {
            PagamentoHistorico::create([
                'mensalidade_id' => $event->mensalidade->id,
                'pagamento_transacao_id' => $event->transacaoId,
                'status_anterior' => $event->statusAnterior,
                'novo_status' => $event->novoStatus,
                'payment_id' => $event->paymentId,
                'external_reference' => $event->externalReference,
                'payload_webhook' => $event->payloadWebhook,
                'resposta_api' => is_array($event->respostaApi) ? $event->respostaApi : null,
            ]);

            Log::info('Historico: Registro criado', [
                'mensalidade_id' => $event->mensalidade->id,
                'status_anterior' => $event->statusAnterior,
                'novo_status' => $event->novoStatus,
                'payment_id' => $event->paymentId,
            ]);
        } catch (\Throwable $e) {
            Log::error('Historico: Erro ao registrar', [
                'error' => $e->getMessage(),
                'mensalidade_id' => $event->mensalidade->id,
            ]);
        }
    }
}
