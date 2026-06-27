<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Revenue extends Model
{
    protected $fillable = [
        'data', 'financial_category_id', 'descricao', 'valor',
        'forma_pagamento', 'cost_center_id', 'comprovante',
        'observacoes', 'origem', 'mensalidade_id', 'status',
        'data_recebimento', 'user_id',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'date',
            'valor' => 'decimal:2',
            'data_recebimento' => 'date',
        ];
    }

    public function category()
    {
        return $this->belongsTo(FinancialCategory::class, 'financial_category_id');
    }

    public function costCenter()
    {
        return $this->belongsTo(CostCenter::class);
    }

    public function mensalidade()
    {
        return $this->belongsTo(Mensalidade::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
