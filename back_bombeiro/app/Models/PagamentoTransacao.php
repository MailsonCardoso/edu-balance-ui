<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PagamentoTransacao extends Model
{
    protected $table = 'pagamento_transacoes';

    protected $fillable = [
        'mensalidade_id', 'origem', 'transacao_id',
        'status', 'payload_request', 'payload_response',
        'payment_url', 'qr_code', 'data_aprovacao',
    ];

    protected function casts(): array
    {
        return [
            'payload_request' => 'array',
            'payload_response' => 'array',
            'data_aprovacao' => 'datetime',
        ];
    }

    public function mensalidade(): BelongsTo
    {
        return $this->belongsTo(Mensalidade::class);
    }
}
