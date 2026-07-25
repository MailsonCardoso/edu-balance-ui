<?php

namespace App\Http\Controllers;

use App\Models\Aluno;
use App\Models\Expense;
use App\Models\Mensalidade;
use App\Models\Revenue;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function financeiro(Request $request): JsonResponse
    {
        $hoje = now();
        $inicioMes = $hoje->copy()->startOfMonth();
        $fimMes = $hoje->copy()->endOfMonth();

        $mensalidadesPagas = Mensalidade::where('status', 'pago')->get();
        $mensalidadesPendentes = Mensalidade::where('status', 'pendente')->get();
        $mensalidadesVencidas = Mensalidade::where('status', 'atrasado')->get();
        $alunosAtivos = Aluno::where('status', 'ativo')->count();
        $alunosInadimplentes = Aluno::whereIn('situacao', ['inadimplente', 'em_atraso'])->count();

        $receitaMensalidades = Mensalidade::where('status', 'pago')
            ->whereBetween('data_pagamento', [$inicioMes, $fimMes])
            ->sum('valor');

        $receitaOutras = Transaction::where('type', 'entrada')
            ->whereBetween('date', [$inicioMes, $fimMes])
            ->sum('amount');

        $despesasMes = Transaction::where('type', 'saida')
            ->whereBetween('date', [$inicioMes, $fimMes])
            ->sum('amount');

        $receitaPrevista = Mensalidade::whereIn('status', ['pendente', 'atrasado'])->sum('valor');

        $receitaPendenteOutras = Revenue::where('status', 'pendente')->sum('valor');

        $despesaPendente = Expense::whereIn('status', ['pendente', 'atrasado'])->sum('valor');

        $receitasMensais = [];
        for ($i = 5; $i >= 0; $i--) {
            $mes = now()->subMonths($i);
            $inicio = $mes->copy()->startOfMonth();
            $fim = $mes->copy()->endOfMonth();

            $mensalidades = Mensalidade::where('status', 'pago')
                ->whereBetween('data_pagamento', [$inicio, $fim])
                ->sum('valor');

            $entradas = Transaction::where('type', 'entrada')
                ->whereBetween('date', [$inicio, $fim])
                ->sum('amount');

            $saidas = Transaction::where('type', 'saida')
                ->whereBetween('date', [$inicio, $fim])
                ->sum('amount');

            $receitasMensais[] = [
                'mes' => $mes->format('M/Y'),
                'receita' => $mensalidades + $entradas,
                'despesa' => $saidas,
            ];
        }

        return response()->json([
            'total_pago' => $mensalidadesPagas->sum('valor') + Revenue::where('status', 'recebido')->sum('valor'),
            'total_pendente' => $receitaPrevista + $receitaPendenteOutras,
            'total_vencido' => $mensalidadesVencidas->sum('valor'),
            'qtd_pagas' => $mensalidadesPagas->count(),
            'qtd_pendentes' => $mensalidadesPendentes->count(),
            'qtd_vencidas' => $mensalidadesVencidas->count(),
            'receita_mes' => $receitaMensalidades + $receitaOutras,
            'despesa_mes' => $despesasMes,
            'saldo_mes' => ($receitaMensalidades + $receitaOutras) - $despesasMes,
            'receita_prevista' => $receitaPrevista + $receitaPendenteOutras,
            'despesa_pendente' => $despesaPendente,
            'alunos_ativos' => $alunosAtivos,
            'alunos_inadimplentes' => $alunosInadimplentes,
            'receitas_mensais' => $receitasMensais,
            'perc_inadimplencia' => $alunosAtivos > 0
                ? round(($alunosInadimplentes / $alunosAtivos) * 100, 1)
                : 0,
        ]);
    }
}
