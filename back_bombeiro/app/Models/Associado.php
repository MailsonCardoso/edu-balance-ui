<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Associado extends Model
{
    protected $fillable = [
        'nome', 'cpf', 'email', 'telefone',
        'nome_aluno', 'password', 'status',
        'aluno_id',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function aluno(): BelongsTo
    {
        return $this->belongsTo(Aluno::class);
    }
}
