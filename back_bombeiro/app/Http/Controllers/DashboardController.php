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
        $inicioJanela = $hoje->copy()->subMonths(5)->startOfMonth();
        $fimJanela = $hoje->copy()->endOfMonth();

        $resumo = [
            'pago' => ['qtd' => 0, 'total' => 0],
            'pendente' => ['qtd' => 0, 'total' => 0],
            'atrasado' => ['qtd' => 0, 'total' => 0],
        ];
        Mensalidade::query()
            ->selectRaw("status, COUNT(*) as qtd, COALESCE(SUM(valor), 0) as total")
            ->whereIn('status', ['pago', 'pendente', 'atrasado'])
            ->groupBy('status')
            ->get()
            ->each(function ($item) use (&$resumo) {
                $resumo[$item->status] = [
                    'qtd' => (int) $item->qtd,
                    'total' => (float) $item->total,
                ];
            });

        $alunosAtivos = Aluno::where('status', 'ativo')->count();
        $alunosInadimplentes = Aluno::whereIn('situacao', ['inadimplente', 'em_atraso'])->count();

        $mensalidadesPorMes = Mensalidade::query()
            ->selectRaw("DATE_FORMAT(data_pagamento, '%Y-%m') as mes, COALESCE(SUM(valor), 0) as total")
            ->where('status', 'pago')
            ->whereNotNull('data_pagamento')
            ->whereBetween('data_pagamento', [$inicioJanela, $fimJanela])
            ->groupByRaw("DATE_FORMAT(data_pagamento, '%Y-%m')")
            ->pluck('total', 'mes')
            ->map(fn ($valor) => (float) $valor)
            ->toArray();

        $entradasPorMes = Transaction::query()
            ->selectRaw("DATE_FORMAT(date, '%Y-%m') as mes, COALESCE(SUM(amount), 0) as total")
            ->where('type', 'entrada')
            ->whereBetween('date', [$inicioJanela, $fimJanela])
            ->where(function ($q) {
                $q->whereNull('source_type')->orWhere('source_type', '!=', 'mensalidade');
            })
            ->groupByRaw("DATE_FORMAT(date, '%Y-%m')")
            ->pluck('total', 'mes')
            ->map(fn ($valor) => (float) $valor)
            ->toArray();

        $saidasPorMes = Transaction::query()
            ->selectRaw("DATE_FORMAT(date, '%Y-%m') as mes, COALESCE(SUM(amount), 0) as total")
            ->where('type', 'saida')
            ->whereBetween('date', [$inicioJanela, $fimJanela])
            ->groupByRaw("DATE_FORMAT(date, '%Y-%m')")
            ->pluck('total', 'mes')
            ->map(fn ($valor) => (float) $valor)
            ->toArray();

        $chaveAtual = $hoje->format('Y-m');
        $receitaMensalidades = $mensalidadesPorMes[$chaveAtual] ?? 0;
        $receitaOutras = $entradasPorMes[$chaveAtual] ?? 0;
        $despesasMes = $saidasPorMes[$chaveAtual] ?? 0;

        $receitaPrevista = $resumo['pendente']['total'] + $resumo['atrasado']['total'];

        $receitaPendenteOutras = Revenue::where('status', 'pendente')->sum('valor');

        $despesaPendente = Expense::whereIn('status', ['pendente', 'atrasado'])->sum('valor');

        $receitasMensais = [];
        for ($i = 5; $i >= 0; $i--) {
            $mes = $hoje->copy()->subMonths($i);
            $chave = $mes->format('Y-m');
            $receitasMensais[] = [
                'mes' => $mes->format('M/Y'),
                'receita' => ($mensalidadesPorMes[$chave] ?? 0) + ($entradasPorMes[$chave] ?? 0),
                'despesa' => $saidasPorMes[$chave] ?? 0,
            ];
        }

        return response()->json([
            'total_pago' => $resumo['pago']['total'] + Revenue::where('status', 'recebido')->sum('valor'),
            'total_pendente' => $receitaPrevista + $receitaPendenteOutras,
            'total_vencido' => $resumo['atrasado']['total'],
            'qtd_pagas' => $resumo['pago']['qtd'],
            'qtd_pendentes' => $resumo['pendente']['qtd'],
            'qtd_vencidas' => $resumo['atrasado']['qtd'],
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
