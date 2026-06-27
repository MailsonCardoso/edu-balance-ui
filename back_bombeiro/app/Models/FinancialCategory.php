<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinancialCategory extends Model
{
    protected $fillable = ['nome', 'tipo', 'cor'];

    protected function casts(): array
    {
        return [
            'tipo' => 'string',
        ];
    }
}
