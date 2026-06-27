<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id', 'acao', 'entidade', 'entidade_id',
        'valores_anteriores', 'valores_novos', 'ip',
    ];

    protected function casts(): array
    {
        return [
            'valores_anteriores' => 'array',
            'valores_novos' => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
