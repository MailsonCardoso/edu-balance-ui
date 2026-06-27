<?php

namespace App\Http\Controllers;

use App\Models\Aluno;
use App\Models\Mensalidade;
use App\Models\Revenue;
use App\Models\Expense;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $hoje = now();
        $inicioMes = $hoje->copy()->startOfMonth();
        $fimMes = $hoje->copy()->endOfMonth();
        $mesPassado = $hoje->copy()->subMonth()->startOfMonth();
        $fimMesPassado = $hoje->copy()->subMonth()->endOfMonth();

        // Mensalidades
        $mensalidadesPagas = Mensalidade::where('status', 'pago')
            ->whereBetween('data_pagamento', [$inicioMes, $fimMes])->get();
        $mensalidadesPendentes = Mensalidade::where('status', 'pendente')->get();
        $mensalidadesVencidas = Mensalidade::where('status', 'atrasado')->get();

        $entradasMes = Revenue::where('status', 'recebido')
            ->whereBetween('data_recebimento', [$inicioMes, $fimMes])->get();
        $saidasMes = Expense::where('status', 'pago')
            ->whereBetween('data_pagamento', [$inicioMes, $fimMes])->get();
        $saidasPendentes = Expense::whereIn('status', ['pendente', 'atrasado'])->get();
        $saidasVencidas = Expense::where('status', 'atrasado')->get();
        $saidasPagas = Expense::where('status', 'pago')
            ->whereBetween('data_pagamento', [$inicioMes, $fimMes])->get();

        $alunosAtivos = Aluno::where('status', 'ativo')->count();
        $alunosInadimplentes = Aluno::whereIn('situacao', ['inadimplente', 'em_atraso'])->count();

        // Cálculos
        $totalEntradas = $mensalidadesPagas->sum('valor') + $entradasMes->sum('valor');
        $totalSaidas = $saidasMes->sum('valor');
        $saldoAtual = Revenue::where('status', 'recebido')->sum('valor')
            - Expense::where('status', 'pago')->sum('valor');
        $saldoMes = $totalEntradas - $totalSaidas;

        $totalMensalidadesAberto = $mensalidadesPendentes->sum('valor');
        $totalMensalidadesVencidas = $mensalidadesVencidas->sum('valor');
        $totalContasPagar = $saidasPendentes->sum('valor');
        $totalContasVencidas = $saidasVencidas->sum('valor');

        $receitaMediaAluno = $alunosAtivos > 0
            ? $mensalidadesPagas->sum('valor') / $alunosAtivos
            : 0;

        $percInadimplencia = $alunosAtivos > 0
            ? round(($alunosInadimplentes / $alunosAtivos) * 100, 1)
            : 0;

        // Receita prevista (mensalidades pendentes do mês + receitas pendentes)
        $receitaPrevista = Revenue::where('status', 'pendente')
            ->whereBetween('data', [$inicioMes, $fimMes])->sum('valor')
            + Mensalidade::whereIn('status', ['pendente', 'atrasado'])
                ->whereBetween('data_vencimento', [$inicioMes, $fimMes])->sum('valor');
        $receitaRecebida = $totalEntradas;

        return response()->json([
            'saldo_atual' => $saldoAtual,
            'entradas_mes' => $totalEntradas,
            'saidas_mes' => $totalSaidas,
            'saldo_mes' => $saldoMes,
            'receita_prevista' => $receitaPrevista,
            'receita_recebida' => $receitaRecebida,
            'mensalidades_aberto' => $totalMensalidadesAberto,
            'mensalidades_vencidas' => $totalMensalidadesVencidas,
            'contas_pagar' => $totalContasPagar,
            'contas_vencidas' => $totalContasVencidas,
            'contas_pagas' => $saidasPagas->sum('valor'),
            'total_alunos_ativos' => $alunosAtivos,
            'receita_media_aluno' => $receitaMediaAluno,
            'perc_inadimplencia' => $percInadimplencia,
            // Dados para gráficos
            'receitas_por_categoria' => $this->receitasPorCategoria($inicioMes, $fimMes),
            'despesas_por_categoria' => $this->despesasPorCategoria($inicioMes, $fimMes),
            'receitas_mensais' => $this->receitasMensais(),
            'despesas_mensais' => $this->despesasMensais(),
            'evolucao_saldo' => $this->evolucaoSaldo(),
            'entradas_x_saidas' => $this->entradasXSaidas(),
            'comparativo_mensal' => $this->comparativoMensal($inicioMes, $fimMes, $mesPassado, $fimMesPassado),
        ]);
    }

    private function receitasPorCategoria($inicio, $fim)
    {
        $receitas = Revenue::where('status', 'recebido')
            ->whereBetween('data_recebimento', [$inicio, $fim])
            ->with('category')
            ->get()
            ->groupBy('financial_category_id');

        $result = [];
        foreach ($receitas as $catId => $items) {
            $cat = $items->first()->category;
            $result[] = [
                'nome' => $cat?->nome ?? 'Sem categoria',
                'valor' => $items->sum('valor'),
                'cor' => $cat?->cor ?? '#6b7280',
            ];
        }

        return $result;
    }

    private function despesasPorCategoria($inicio, $fim)
    {
        $despesas = Expense::where('status', 'pago')
            ->whereBetween('data_pagamento', [$inicio, $fim])
            ->with('category')
            ->get()
            ->groupBy('financial_category_id');

        $result = [];
        foreach ($despesas as $catId => $items) {
            $cat = $items->first()->category;
            $result[] = [
                'nome' => $cat?->nome ?? 'Sem categoria',
                'valor' => $items->sum('valor'),
                'cor' => $cat?->cor ?? '#6b7280',
            ];
        }

        return $result;
    }

    private function receitasMensais()
    {
        $data = [];
        for ($i = 5; $i >= 0; $i--) {
            $mes = now()->subMonths($i);
            $inicio = $mes->copy()->startOfMonth();
            $fim = $mes->copy()->endOfMonth();

            $mensalidades = Mensalidade::where('status', 'pago')
                ->whereBetween('data_pagamento', [$inicio, $fim])->sum('valor');
            $receitas = Revenue::where('status', 'recebido')
                ->whereBetween('data_recebimento', [$inicio, $fim])->sum('valor');

            $data[] = [
                'mes' => $mes->format('M/Y'),
                'receita' => $mensalidades + $receitas,
            ];
        }
        return $data;
    }

    private function despesasMensais()
    {
        $data = [];
        for ($i = 5; $i >= 0; $i--) {
            $mes = now()->subMonths($i);
            $inicio = $mes->copy()->startOfMonth();
            $fim = $mes->copy()->endOfMonth();

            $data[] = [
                'mes' => $mes->format('M/Y'),
                'despesa' => Expense::where('status', 'pago')
                    ->whereBetween('data_pagamento', [$inicio, $fim])->sum('valor'),
            ];
        }
        return $data;
    }

    private function evolucaoSaldo()
    {
        $data = [];
        $saldo = 0;
        for ($i = 5; $i >= 0; $i--) {
            $mes = now()->subMonths($i);
            $inicio = $mes->copy()->startOfMonth();
            $fim = $mes->copy()->endOfMonth();

            $receitas = Mensalidade::where('status', 'pago')
                ->whereBetween('data_pagamento', [$inicio, $fim])->sum('valor')
                + Revenue::where('status', 'recebido')
                    ->whereBetween('data_recebimento', [$inicio, $fim])->sum('valor');

            $despesas = Expense::where('status', 'pago')
                ->whereBetween('data_pagamento', [$inicio, $fim])->sum('valor');

            $saldo += $receitas - $despesas;

            $data[] = [
                'mes' => $mes->format('M/Y'),
                'saldo' => $saldo,
            ];
        }
        return $data;
    }

    private function entradasXSaidas()
    {
        $data = [];
        for ($i = 5; $i >= 0; $i--) {
            $mes = now()->subMonths($i);
            $inicio = $mes->copy()->startOfMonth();
            $fim = $mes->copy()->endOfMonth();

            $receitas = Mensalidade::where('status', 'pago')
                ->whereBetween('data_pagamento', [$inicio, $fim])->sum('valor')
                + Revenue::where('status', 'recebido')
                    ->whereBetween('data_recebimento', [$inicio, $fim])->sum('valor');

            $despesas = Expense::where('status', 'pago')
                ->whereBetween('data_pagamento', [$inicio, $fim])->sum('valor');

            $data[] = [
                'mes' => $mes->format('M/Y'),
                'entradas' => $receitas,
                'saidas' => $despesas,
            ];
        }
        return $data;
    }

    private function comparativoMensal($inicioMes, $fimMes, $mesPassado, $fimMesPassado)
    {
        $entradasMes = Mensalidade::where('status', 'pago')
            ->whereBetween('data_pagamento', [$inicioMes, $fimMes])->sum('valor')
            + Revenue::where('status', 'recebido')
                ->whereBetween('data_recebimento', [$inicioMes, $fimMes])->sum('valor');

        $entradasPassado = Mensalidade::where('status', 'pago')
            ->whereBetween('data_pagamento', [$mesPassado, $fimMesPassado])->sum('valor')
            + Revenue::where('status', 'recebido')
                ->whereBetween('data_recebimento', [$mesPassado, $fimMesPassado])->sum('valor');

        $saidasMes = Expense::where('status', 'pago')
            ->whereBetween('data_pagamento', [$inicioMes, $fimMes])->sum('valor');

        $saidasPassado = Expense::where('status', 'pago')
            ->whereBetween('data_pagamento', [$mesPassado, $fimMesPassado])->sum('valor');

        return [
            'mes_atual' => now()->format('M/Y'),
            'mes_anterior' => now()->subMonth()->format('M/Y'),
            'entradas_atual' => $entradasMes,
            'entradas_anterior' => $entradasPassado,
            'saidas_atual' => $saidasMes,
            'saidas_anterior' => $saidasPassado,
        ];
    }
}
