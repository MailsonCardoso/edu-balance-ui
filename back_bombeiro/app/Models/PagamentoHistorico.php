<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PagamentoHistorico extends Model
{
    protected $table = 'pagamento_historico';

    protected $fillable = [
        'mensalidade_id',
        'pagamento_transacao_id',
        'status_anterior',
        'novo_status',
        'payment_id',
        'external_reference',
        'usuario_responsavel',
        'payload_webhook',
        'resposta_api',
    ];

    protected function casts(): array
    {
        return [
            'payload_webhook' => 'array',
            'resposta_api' => 'array',
        ];
    }

    public function mensalidade(): BelongsTo
    {
        return $this->belongsTo(Mensalidade::class);
    }

    public function transacao(): BelongsTo
    {
        return $this->belongsTo(PagamentoTransacao::class, 'pagamento_transacao_id');
    }
}
