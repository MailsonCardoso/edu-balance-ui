<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Aluno extends Model
{
    protected $fillable = [
        'nome', 'cpf', 'data_nascimento', 'telefone', 'email', 'endereco',
        'responsavel', 'cpf_responsavel', 'telefone_responsavel',
        'turma', 'status', 'situacao',
        'valor_mensalidade', 'dia_vencimento',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'string',
            'situacao' => 'string',
        ];
    }

    public function mensalidades(): HasMany
    {
        return $this->hasMany(Mensalidade::class);
    }
}
