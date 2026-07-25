<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MonthlyClosure extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'month', 'year', 'closing_balance', 'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'closing_balance' => 'decimal:2',
            'closed_at' => 'datetime',
        ];
    }
}
