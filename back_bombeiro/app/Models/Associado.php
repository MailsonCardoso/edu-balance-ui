<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Associado extends Model
{
    protected $fillable = [
        'nome', 'cpf', 'email', 'telefone',
        'nome_aluno', 'password', 'status',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }
}
