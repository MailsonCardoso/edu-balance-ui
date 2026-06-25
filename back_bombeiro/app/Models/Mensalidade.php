<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
}
