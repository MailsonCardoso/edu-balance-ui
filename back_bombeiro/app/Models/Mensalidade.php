<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Mensalidade extends Model
{
    protected $fillable = [
        'aluno_id', 'mes_referencia', 'valor',
        'data_vencimento', 'data_pagamento', 'status',
        'forma_pagamento',
    ];

    protected function casts(): array
    {
        return [
            'valor' => 'decimal:2',
            'data_vencimento' => 'date',
            'data_pagamento' => 'date',
            'status' => 'string',
            'forma_pagamento' => 'string',
        ];
    }

    public function aluno(): BelongsTo
    {
        return $this->belongsTo(Aluno::class);
    }
}
