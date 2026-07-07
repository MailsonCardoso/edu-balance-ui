<?php

namespace App\Events;

use App\Models\Mensalidade;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MensalidadeStatusUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Mensalidade $mensalidade,
        public readonly ?string $statusAnterior,
        public readonly string $novoStatus,
        public readonly ?string $paymentId,
        public readonly ?string $externalReference,
        public readonly ?array $payloadWebhook,
        public readonly mixed $respostaApi,
        public readonly ?int $transacaoId = null,
    ) {}
}
