<?php

namespace App\Http\Controllers;

use App\Models\Aluno;
use App\Models\Associado;
use App\Models\Mensalidade;
use Illuminate\Http\JsonResponse;

class TransparenciaController extends Controller
{
    public function index(): JsonResponse
    {
        $totalAlunos = Aluno::count();
        $alunosAtivos = Aluno::where('status', 'ativo')->count();
        $inadimplentes = Aluno::where('situacao', 'inadimplente')->count();
        $emAtraso = Aluno::where('situacao', 'em_atraso')->count();
        $emDia = Aluno::where('situacao', 'em_dia')->count();

        $receitasMes = Mensalidade::where('status', 'pago')
            ->whereMonth('data_pagamento', now()->month)
            ->whereYear('data_pagamento', now()->year)
            ->sum('valor');

        $receitasAno = Mensalidade::where('status', 'pago')
            ->whereYear('data_pagamento', now()->year)
            ->sum('valor');

        $aReceber = Mensalidade::whereIn('status', ['pendente', 'atrasado'])
            ->sum('valor');

        $totalPago = Mensalidade::where('status', 'pago')->sum('valor');

        $totalMensalidades = Mensalidade::count();
        $mensalidadesPagas = Mensalidade::where('status', 'pago')->count();
        $mensalidadesPendentes = Mensalidade::where('status', 'pendente')->count();
        $mensalidadesAtrasadas = Mensalidade::where('status', 'atrasado')->count();

        $totalAssociados = Associado::count();
        $totalMensalidadesPrevistas = Aluno::where('status', 'ativo')->sum('valor_mensalidade');

        return response()->json([
            'data' => [
                'total_associados' => $totalAssociados,
                'alunos' => [
                    'total' => $totalAlunos,
                    'ativos' => $alunosAtivos,
                    'em_dia' => $emDia,
                    'em_atraso' => $emAtraso,
                    'inadimplentes' => $inadimplentes,
                ],
                'financeiro' => [
                    'receitas_mes' => (float) $receitasMes,
                    'receitas_ano' => (float) $receitasAno,
                    'a_receber' => (float) $aReceber,
                    'total_pago' => (float) $totalPago,
                    'total_mensalidades_previstas' => (float) $totalMensalidadesPrevistas,
                ],
                'mensalidades' => [
                    'total' => $totalMensalidades,
                    'pagas' => $mensalidadesPagas,
                    'pendentes' => $mensalidadesPendentes,
                    'atrasadas' => $mensalidadesAtrasadas,
                ],
            ],
        ]);
    }
}
