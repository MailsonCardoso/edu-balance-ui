<?php

namespace App\Http\Controllers;

use App\Models\Aluno;
use App\Models\Mensalidade;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MensalidadeController extends Controller
{
    public function index()
    {
        return Mensalidade::with('aluno')->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'aluno_id' => 'required|exists:alunos,id',
            'mes_referencia' => 'required|string|max:20',
            'valor' => 'required|numeric|min:0',
            'data_vencimento' => 'required|date',
            'data_pagamento' => 'nullable|date',
            'status' => 'required|in:pendente,pago,atrasado',
            'forma_pagamento' => 'nullable|in:pix,debito,credito',
            'origem' => 'nullable|in:mercadopago,caixa,admin,pix_manual,dinheiro,transferencia',
        ]);

        return Mensalidade::create($validated);
    }

    public function show(Mensalidade $mensalidade)
    {
        return $mensalidade->load('aluno');
    }

    public function update(Request $request, Mensalidade $mensalidade)
    {
        $validated = $request->validate([
            'aluno_id' => 'sometimes|exists:alunos,id',
            'mes_referencia' => 'sometimes|string|max:7',
            'valor' => 'sometimes|numeric|min:0',
            'data_vencimento' => 'sometimes|date',
            'data_pagamento' => 'nullable|date',
            'status' => 'sometimes|in:pendente,pago,atrasado',
            'forma_pagamento' => 'nullable|in:pix,debito,credito',
            'origem' => 'nullable|in:mercadopago,caixa,admin,pix_manual,dinheiro,transferencia',
        ]);

        $mensalidade->update($validated);
        return $mensalidade;
    }

    public function verificarVencidas(): JsonResponse
    {
        $hoje = now()->format('Y-m-d');
        $vencidas = Mensalidade::where('status', 'pendente')
            ->where('data_vencimento', '<', $hoje)
            ->get();

        foreach ($vencidas as $m) {
            $m->update(['status' => 'atrasado']);
        }

        $alunoIds = $vencidas->pluck('aluno_id')->unique();
        foreach ($alunoIds as $alunoId) {
            $totalAtrasadas = Mensalidade::where('aluno_id', $alunoId)
                ->where('status', 'atrasado')
                ->where('data_vencimento', '<', $hoje)
                ->count();

            $diasMaiorAtraso = Mensalidade::where('aluno_id', $alunoId)
                ->where('status', 'atrasado')
                ->where('data_vencimento', '<', $hoje)
                ->min('data_vencimento');

            $situacao = 'em_atraso';
            if ($totalAtrasadas >= 3 || ($diasMaiorAtraso && now()->diffInDays($diasMaiorAtraso) > 90)) {
                $situacao = 'inadimplente';
            }

            Aluno::where('id', $alunoId)->update(['situacao' => $situacao]);
        }

        $alunosEmDia = Aluno::whereIn('situacao', ['em_atraso', 'inadimplente'])
            ->whereDoesntHave('mensalidades', function ($q) use ($hoje) {
                $q->where('status', 'atrasado')->where('data_vencimento', '<', $hoje);
            })
            ->pluck('id');

        if ($alunosEmDia->isNotEmpty()) {
            Aluno::whereIn('id', $alunosEmDia)->update(['situacao' => 'em_dia']);
        }

        return response()->json([
            'atualizadas' => $vencidas->count(),
            'regularizadas' => $alunosEmDia->count(),
        ]);
    }

    public function destroy(Mensalidade $mensalidade)
    {
        $mensalidade->delete();
        return response()->noContent();
    }
}
