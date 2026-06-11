<?php

namespace App\Http\Controllers;

use App\Models\Aluno;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResponsavelController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'senha' => 'required|string',
        ]);

        $cpfLimpo = preg_replace('/\D/', '', $validated['senha']);
        $cpfMascarado = substr($cpfLimpo, 0, 3) . '.' . substr($cpfLimpo, 3, 3) . '.' . substr($cpfLimpo, 6, 3) . '-' . substr($cpfLimpo, 9, 2);

        $alunos = Aluno::with('mensalidades')
            ->where('email', $validated['email'])
            ->where(function ($q) use ($cpfLimpo, $cpfMascarado) {
                $q->where('cpf_responsavel', $cpfLimpo)
                  ->orWhere('cpf_responsavel', $cpfMascarado);
            })
            ->get();

        if ($alunos->isEmpty()) {
            return response()->json(['message' => 'E-mail ou senha inválidos'], 401);
        }

        return response()->json([
            'responsavel' => [
                'nome' => $alunos->first()->responsavel,
                'email' => $validated['email'],
            ],
            'alunos' => $alunos->map(function ($a) {
                return [
                    'id' => $a->id,
                    'nome' => $a->nome,
                    'sexo' => $a->sexo,
                    'turma' => $a->turma,
                    'status' => $a->status,
                    'situacao' => $a->situacao,
                    'mensalidades' => $a->mensalidades->map(function ($m) {
                        return [
                            'id' => $m->id,
                            'mes_referencia' => $m->mes_referencia,
                            'valor' => $m->valor,
                            'data_vencimento' => $m->data_vencimento,
                            'data_pagamento' => $m->data_pagamento,
                            'status' => $m->status,
                            'forma_pagamento' => $m->forma_pagamento,
                        ];
                    }),
                ];
            }),
        ]);
    }
}
