<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class LimparFinanceiro extends Command
{
    protected $signature = 'financeiro:limpar {--force : Exclui sem pedir confirmacao}';
    protected $description = 'Remove todos os dados de teste das telas de mensalidades, fluxo de caixa e auditoria';

    public function handle(): int
    {
        if (!$this->option('force') && !$this->confirm('Isso apaga TODAS as mensalidades, transacoes, fechamentos e pagamentos. Continuar?', false)) {
            $this->error('Operacao cancelada.');
            return Command::FAILURE;
        }

        $counts = [];
        $tables = [
            'pagamento_historico',
            'pagamento_transacoes',
            'transactions',
            'monthly_closures',
            'mensalidades',
        ];

        DB::beginTransaction();
        try {
            foreach ($tables as $table) {
                $counts[$table] = DB::table($table)->count();
                DB::table($table)->delete();
            }
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error('Erro ao limpar dados: ' . $e->getMessage());
            return Command::FAILURE;
        }

        foreach ($tables as $table) {
            $this->info($table . ': ' . $counts[$table] . ' registro(s) removido(s)');
        }

        $this->info('Dados financeiros de teste removidos com sucesso.');
        return Command::SUCCESS;
    }
}