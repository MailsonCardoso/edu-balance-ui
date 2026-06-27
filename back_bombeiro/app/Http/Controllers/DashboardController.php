<?php

namespace App\Http\Controllers;

use App\Models\Aluno;
use App\Models\Mensalidade;
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

        $receitaMes = Mensalidade::where('status', 'pago')
            ->whereBetween('data_pagamento', [$inicioMes, $fimMes])
            ->sum('valor');

        $receitaPrevista = Mensalidade::whereIn('status', ['pendente', 'atrasado'])
            ->sum('valor');

        // Últimos 6 meses para gráfico
        $receitasMensais = [];
        for ($i = 5; $i >= 0; $i--) {
            $mes = now()->subMonths($i);
            $inicio = $mes->copy()->startOfMonth();
            $fim = $mes->copy()->endOfMonth();
            $receitasMensais[] = [
                'mes' => $mes->format('M/Y'),
                'receita' => Mensalidade::where('status', 'pago')
                    ->whereBetween('data_pagamento', [$inicio, $fim])
                    ->sum('valor'),
            ];
        }

        return response()->json([
            'total_pago' => $mensalidadesPagas->sum('valor'),
            'total_pendente' => $mensalidadesPendentes->sum('valor'),
            'total_vencido' => $mensalidadesVencidas->sum('valor'),
            'qtd_pagas' => $mensalidadesPagas->count(),
            'qtd_pendentes' => $mensalidadesPendentes->count(),
            'qtd_vencidas' => $mensalidadesVencidas->count(),
            'receita_mes' => $receitaMes,
            'receita_prevista' => $receitaPrevista,
            'alunos_ativos' => $alunosAtivos,
            'alunos_inadimplentes' => $alunosInadimplentes,
            'receitas_mensais' => $receitasMensais,
            'perc_inadimplencia' => $alunosAtivos > 0
                ? round(($alunosInadimplentes / $alunosAtivos) * 100, 1)
                : 0,
        ]);
    }
}
