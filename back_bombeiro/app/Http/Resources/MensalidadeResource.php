<?php

namespace App\Http\Resources;

use App\Models\Mensalidade;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MensalidadeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var Mensalidade $this */
        $transacao = $this->ultimaTransacao;

        return [
            'id' => $this->id,
            'aluno_id' => $this->aluno_id,
            'mes_referencia' => $this->mes_referencia,
            'valor' => (float) $this->valor,
            'data_vencimento' => $this->data_vencimento->format('d/m/Y'),
            'data_pagamento' => $this->data_pagamento?->format('d/m/Y'),
            'status' => $this->status,
            'forma_pagamento' => $this->forma_pagamento,
            'origem' => $this->origem,
            'aluno_nome' => $this->aluno?->nome,
            'aluno_responsavel' => $this->aluno?->responsavel,
            'transacao' => $transacao ? [
                'id' => $transacao->id,
                'payment_id' => $transacao->payment_id,
                'preference_id' => $transacao->preference_id,
                'external_reference' => $transacao->external_reference,
                'status_mp' => $transacao->status,
                'payment_url' => $transacao->payment_url,
                'payment_method' => $transacao->payment_method,
                'qr_code' => $transacao->qr_code,
            ] : null,
            'created_at' => $this->created_at->format('d/m/Y H:i'),
        ];
    }
}
