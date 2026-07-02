<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patrimonio extends Model
{
    protected $fillable = [
        'tag', 'nome', 'numeroSerie', 'categoria', 'localizacao',
        'responsavel', 'setor', 'valorCompra', 'valorDepreciado',
        'dataCompra', 'dataUltimaAuditoria', 'status', 'observacao',
    ];

    protected function casts(): array
    {
        return [
            'valorCompra' => 'decimal:2',
            'valorDepreciado' => 'decimal:2',
            'dataCompra' => 'date',
            'dataUltimaAuditoria' => 'date',
            'status' => 'string',
        ];
    }
}
