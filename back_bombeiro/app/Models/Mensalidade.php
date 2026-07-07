<?php

namespace App\Models;

use App\Enums\MensalidadeStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Mensalidade extends Model
{
    protected $fillable = [
        'aluno_id', 'mes_referencia', 'valor',
        'data_vencimento', 'data_pagamento', 'status',
        'forma_pagamento', 'origem',
    ];

    protected function casts(): array
    {
        return [
            'valor' => 'decimal:2',
            'data_vencimento' => 'date',
            'data_pagamento' => 'date',
            'status' => 'string',
            'forma_pagamento' => 'string',
            'origem' => 'string',
        ];
    }

    public function aluno(): BelongsTo
    {
        return $this->belongsTo(Aluno::class);
    }

    public function transacoes(): HasMany
    {
        return $this->hasMany(PagamentoTransacao::class);
    }

    public function transacaoAtiva(): HasOne
    {
        return $this->hasOne(PagamentoTransacao::class)
            ->whereNotIn('status', ['approved', 'rejected', 'cancelled', 'refunded', 'charged_back', 'expired'])
            ->latestOfMany();
    }

    public function ultimaTransacao(): HasOne
    {
        return $this->hasOne(PagamentoTransacao::class)->latestOfMany();
    }

    public function historicos(): HasMany
    {
        return $this->hasMany(PagamentoHistorico::class);
    }

    public function isPago(): bool
    {
        return $this->status === MensalidadeStatus::Pago->value;
    }

    public function isPendente(): bool
    {
        return $this->status === MensalidadeStatus::Pendente->value || $this->status === MensalidadeStatus::Atrasado->value;
    }
}
