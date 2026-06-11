<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ouvidoria extends Model
{
    protected $fillable = [
        'nome', 'email', 'tipo', 'mensagem',
        'anonimo', 'protocolo', 'status',
    ];

    protected function casts(): array
    {
        return [
            'anonimo' => 'boolean',
            'status' => 'string',
            'tipo' => 'string',
        ];
    }
}
