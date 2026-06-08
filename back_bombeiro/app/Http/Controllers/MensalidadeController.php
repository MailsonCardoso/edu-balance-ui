<?php

namespace App\Http\Controllers;

use App\Models\Mensalidade;
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
            'mes_referencia' => 'required|string|max:7',
            'valor' => 'required|numeric|min:0',
            'data_vencimento' => 'required|date',
            'data_pagamento' => 'nullable|date',
            'status' => 'required|in:pendente,pago,atrasado',
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
        ]);

        $mensalidade->update($validated);
        return $mensalidade;
    }

    public function destroy(Mensalidade $mensalidade)
    {
        $mensalidade->delete();
        return response()->noContent();
    }
}
