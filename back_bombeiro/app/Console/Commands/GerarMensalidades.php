<?php

namespace App\Console\Commands;

use App\Models\Aluno;
use App\Models\Mensalidade;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class GerarMensalidades extends Command
{
    protected $signature = 'mensalidades:gerar-proximo-mes';
    protected $description = 'Gera mensalidades do proximo mes para todos os alunos ativos';

    private array $meses = [
        1 => 'Janeiro', 2 => 'Fevereiro', 3 => 'Marco', 4 => 'Abril',
        5 => 'Maio', 6 => 'Junho', 7 => 'Julho', 8 => 'Agosto',
        9 => 'Setembro', 10 => 'Outubro', 11 => 'Novembro', 12 => 'Dezembro',
    ];

    public function handle(): int
    {
        $proximoMes = Carbon::now()->addMonth();
        $ano = $proximoMes->year;
        $mesNum = $proximoMes->month;

        $mesRef = $this->meses[$mesNum] . '/' . $ano;
        $diaVencimento = 10;

        $vencimento = sprintf('%d-%02d-%02d', $ano, $mesNum, $diaVencimento);

        $alunos = Aluno::where('status', 'ativo')
            ->where('valor_mensalidade', '>', 0)
            ->get();

        $this->info("Gerando mensalidades para {$mesRef}");
        $this->info("Total de alunos ativos: {$alunos->count()}");

        $criadas = 0;
        $puladas = 0;

        foreach ($alunos as $aluno) {
            $jaExiste = Mensalidade::where('aluno_id', $aluno->id)
                ->where('mes_referencia', $mesRef)
                ->exists();

            if ($jaExiste) {
                $puladas++;
                continue;
            }

            Mensalidade::create([
                'aluno_id' => $aluno->id,
                'mes_referencia' => $mesRef,
                'valor' => $aluno->valor_mensalidade,
                'data_vencimento' => $vencimento,
                'status' => 'pendente',
            ]);

            $criadas++;
        }

        $this->info("Criadas: {$criadas} | Puladas (ja existem): {$puladas}");

        Log::info('Command: Mensalidades geradas', [
            'mes_referencia' => $mesRef,
            'criadas' => $criadas,
            'puladas' => $puladas,
            'total_alunos' => $alunos->count(),
        ]);

        return Command::SUCCESS;
    }
}
