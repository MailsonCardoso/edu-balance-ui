<?php

namespace App\Models;

use App\Enums\MercadoPagoStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PagamentoTransacao extends Model
{
    protected $table = 'pagamento_transacoes';

    protected $fillable = [
        'mensalidade_id',
        'payment_id',
        'preference_id',
        'external_reference',
        'origem',
        'transacao_id',
        'status',
        'payment_method',
        'payer_email',
        'notification_url',
        'payload_request',
        'payload_response',
        'payment_url',
        'qr_code',
        'data_aprovacao',
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

    public function isApproved(): bool
    {
        return $this->status === MercadoPagoStatus::Approved->value;
    }

    public function isPending(): bool
    {
        return in_array($this->status, [
            MercadoPagoStatus::Pending->value,
            MercadoPagoStatus::InProcess->value,
            MercadoPagoStatus::Authorized->value,
        ]);
    }
}
