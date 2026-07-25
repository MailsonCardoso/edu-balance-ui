<?php

namespace App\Console\Commands;

use App\Models\Expense;
use App\Models\Revenue;
use App\Models\Transaction;
use Illuminate\Console\Command;

class SyncTransactions extends Command
{
    protected $signature = 'sync:transactions';
    protected $description = 'Sincroniza receitas e despesas existentes para a tabela transactions';

    public function handle(): void
    {
        $this->info('Sincronizando receitas recebidas...');
        Revenue::where('status', 'recebido')->chunk(100, function ($revenues) {
            foreach ($revenues as $r) {
                Transaction::updateOrCreate(
                    ['source_type' => 'revenue', 'source_id' => $r->id],
                    [
                        'description' => $r->descricao,
                        'amount' => $r->valor,
                        'type' => 'entrada',
                        'category_name' => $r->category?->nome ?? 'Receitas',
                        'date' => $r->data_recebimento ?? $r->data,
                        'created_at' => $r->created_at,
                        'updated_at' => $r->updated_at,
                    ]
                );
            }
        });

        $this->info('Sincronizando despesas pagas...');
        Expense::where('status', 'pago')->chunk(100, function ($expenses) {
            foreach ($expenses as $e) {
                Transaction::updateOrCreate(
                    ['source_type' => 'expense', 'source_id' => $e->id],
                    [
                        'description' => $e->descricao,
                        'amount' => $e->valor,
                        'type' => 'saida',
                        'category_name' => $e->category?->nome ?? 'Despesas',
                        'date' => $e->data_pagamento ?? $e->data_vencimento,
                        'created_at' => $e->created_at,
                        'updated_at' => $e->updated_at,
                    ]
                );
            }
        });

        $this->info('Sincronização concluída!');
    }
}
