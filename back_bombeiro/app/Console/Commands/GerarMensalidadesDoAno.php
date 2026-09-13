<?php

namespace App\Console\Commands;

use App\Models\Aluno;
use App\Models\Mensalidade;
use Illuminate\Console\Command;

class GerarMensalidadesDoAno extends Command
{
    protected $signature = 'mensalidades:gerar-ano {ano=2026}';
    protected $description = 'Gera as mensalidades de janeiro a dezembro do ano informado para todos os alunos ativos';

    public function handle(): int
    {
        $ano = (int) $this->argument('ano');

        if ($ano < 2000 || $ano > 2100) {
            $this->error("Ano inválido: {$ano}");
            return Command::FAILURE;
        }

        $alunos = Aluno::where('status', 'ativo')
            ->where('valor_mensalidade', '>', 0)
            ->get(['id', 'valor_mensalidade', 'dia_vencimento']);

        if ($alunos->isEmpty()) {
            $this->warn('Nenhum aluno ativo com valor de mensalidade definido.');
            return Command::SUCCESS;
        }

        $this->info(
            'Gerando mensalidades de 01/' . $ano . ' a 12/' . $ano . ' para ' . $alunos->count() . ' aluno(s)...'
        );

        $totalCriadas = 0;

        foreach (range(1, 12) as $mes) {
            $mm = str_pad((string) $mes, 2, '0', STR_PAD_LEFT);
            $mesRef = "{$mm}/{$ano}";
            $ultimoDia = cal_days_in_month(CAL_GREGORIAN, $mes, $ano);

            $existentes = Mensalidade::where('mes_referencia', $mesRef)
                ->pluck('aluno_id')
                ->all();
            $setExistentes = array_flip($existentes);

            $rows = [];
            foreach ($alunos as $aluno) {
                if (isset($setExistentes[$aluno->id])) {
                    continue;
                }

                $dia = min($aluno->dia_vencimento ?? 10, $ultimoDia);

                $rows[] = [
                    'aluno_id' => $aluno->id,
                    'mes_referencia' => $mesRef,
                    'valor' => $aluno->valor_mensalidade,
                    'valor_cobrado' => $aluno->valor_mensalidade,
                    'data_vencimento' => "{$ano}-{$mm}-" . str_pad((string) $dia, 2, '0', STR_PAD_LEFT),
                    'status' => 'pendente',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            $criadas = 0;
            foreach (array_chunk($rows, 500) as $chunk) {
                Mensalidade::insert($chunk);
                $criadas += count($chunk);
            }

            $totalCriadas += $criadas;
            $this->info("  {$mesRef}: criadas {$criadas} | já existentes " . count($existentes));
        }

        $this->info("Concluído: {$totalCriadas} mensalidade(s) criada(s) em {$ano}.");
        return Command::SUCCESS;
    }
}