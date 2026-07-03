<?php

namespace App\Http\Controllers;

use App\Models\Aluno;
use App\Models\Associado;
use App\Models\Mensalidade;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AssociadoController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'cpf' => 'required|string|size:11|unique:associados,cpf',
            'email' => 'required|email|max:255|unique:associados,email',
            'telefone' => 'required|string|max:20',
            'nome_aluno' => 'nullable|string|max:255',
            'password' => 'required|string|min:6',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['status'] = 'ativo';

        $aluno = $this->buscarAlunoPorCpf($validated['cpf']);
        if ($aluno) {
            $validated['aluno_id'] = $aluno->id;
            $validated['nome_aluno'] ??= $this->formatarNomesAlunos($aluno);
        }

        $associado = Associado::create($validated);

        $token = Str::random(60);
        $associado->forceFill(['api_token' => $token])->save();

        return response()->json([
            'success' => true,
            'message' => 'Cadastro realizado com sucesso!',
            'associado' => [
                'id' => $associado->id,
                'nome' => $associado->nome,
                'email' => $associado->email,
            ],
            'token' => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $associado = Associado::where('email', $request->email)->first();

        if (!$associado || !Hash::check($request->password, $associado->password)) {
            return response()->json([
                'success' => false,
                'message' => 'E-mail ou senha inválidos.',
            ], 401);
        }

        if (!$associado->aluno_id) {
            $aluno = $this->buscarAlunoPorCpf($associado->cpf);
            if ($aluno) {
                $associado->forceFill(['aluno_id' => $aluno->id, 'nome_aluno' => $this->formatarNomesAlunos($aluno)])->save();
                $associado->refresh();
            }
        }

        $token = Str::random(60);
        $associado->forceFill(['api_token' => $token])->save();

        return response()->json([
            'success' => true,
            'message' => 'Login realizado com sucesso.',
            'associado' => [
                'id' => $associado->id,
                'nome' => $associado->nome,
                'email' => $associado->email,
                'telefone' => $associado->telefone,
                'cpf' => $associado->cpf,
                'nome_aluno' => $associado->nome_aluno,
                'status' => $associado->status,
                'created_at' => $associado->created_at->format('d/m/Y'),
            ],
            'token' => $token,
        ]);
    }

    public function show(Request $request): JsonResponse
    {
        $associado = $this->getAuthenticated($request);

        if (!$associado) {
            return response()->json(['success' => false, 'message' => 'Não autorizado.'], 401);
        }

        if (!$associado->aluno_id) {
            $aluno = $this->buscarAlunoPorCpf($associado->cpf);
            if ($aluno) {
                $associado->forceFill(['aluno_id' => $aluno->id, 'nome_aluno' => $aluno->nome])->save();
                $associado->refresh();
            }
        }

        return response()->json([
            'success' => true,
            'associado' => [
                'id' => $associado->id,
                'nome' => $associado->nome,
                'email' => $associado->email,
                'telefone' => $associado->telefone,
                'cpf' => $associado->cpf,
                'nome_aluno' => $associado->nome_aluno,
                'aluno_nome' => $associado->aluno?->nome,
                'status' => $associado->status,
                'created_at' => $associado->created_at->format('d/m/Y'),
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $associado = $this->getAuthenticated($request);

        if (!$associado) {
            return response()->json(['success' => false, 'message' => 'Não autorizado.'], 401);
        }

        $validated = $request->validate([
            'nome' => 'sometimes|string|max:255',
            'telefone' => 'sometimes|string|max:20',
            'nome_aluno' => 'sometimes|nullable|string|max:255',
            'email' => 'sometimes|email|max:255|unique:associados,email,' . $associado->id,
        ]);

        $associado->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Dados atualizados com sucesso.',
        ]);
    }

    public function mensalidades(Request $request): JsonResponse
    {
        $associado = $this->getAuthenticated($request);

        if (!$associado) {
            return response()->json(['success' => false, 'message' => 'Não autorizado.'], 401);
        }

        $query = Mensalidade::with('aluno')->orderBy('data_vencimento', 'desc');

        // If associado has a linked aluno_id, use it
        if ($associado->aluno_id) {
            $query->where('aluno_id', $associado->aluno_id);
        } elseif ($associado->nome_aluno) {
            // Fallback: match by aluno name
            $query->whereHas('aluno', function ($q) use ($associado) {
                $q->where('nome', $associado->nome_aluno);
            });
        } else {
            return response()->json(['success' => true, 'data' => []]);
        }

        $mensalidades = $query->get()->map(function ($m) {
            return [
                'id' => $m->id,
                'aluno_id' => $m->aluno_id,
                'mes_referencia' => $m->mes_referencia,
                'valor' => $m->valor,
                'data_vencimento' => $m->data_vencimento->format('d/m/Y'),
                'data_pagamento' => $m->data_pagamento?->format('d/m/Y'),
                'status' => $m->status,
                'forma_pagamento' => $m->forma_pagamento,
                'origem' => $m->origem,
                'aluno_nome' => $m->aluno?->nome,
                'created_at' => $m->created_at->format('d/m/Y H:i'),
            ];
        });

        return response()->json(['success' => true, 'data' => $mensalidades]);
    }

    public function listAll(): JsonResponse
    {
        $associados = Associado::with('aluno:id,nome')
            ->orderBy('created_at', 'desc')
            ->get();

        $cpfVariations = [];
        $cpfMap = [];
        foreach ($associados as $a) {
            $clean = preg_replace('/\D/', '', $a->cpf);
            $formatted = preg_replace('/(\d{3})(\d{3})(\d{3})(\d{2})/', '$1.$2.$3-$4', $clean);
            $cpfVariations[$clean] = true;
            $cpfVariations[$formatted] = true;
            $cpfMap[$a->cpf] = ['clean' => $clean, 'formatted' => $formatted];
        }

        $allAlunos = Aluno::whereIn('cpf_responsavel', array_keys($cpfVariations))
            ->get()
            ->groupBy('cpf_responsavel');

        $result = $associados->map(fn ($a) => [
            'id' => $a->id,
            'nome' => $a->nome,
            'cpf' => $a->cpf,
            'email' => $a->email,
            'telefone' => $a->telefone,
            'nome_aluno' => $a->nome_aluno,
            'aluno_nome' => $a->aluno?->nome,
            'alunos' => ($allAlunos[$cpfMap[$a->cpf]['clean']] ?? $allAlunos[$cpfMap[$a->cpf]['formatted']] ?? collect())
                ->map(fn ($al) => ['nome' => $al->nome])
                ->values()
                ->toArray(),
            'status' => $a->status,
            'created_at' => $a->created_at->format('d/m/Y'),
        ]);

        return response()->json(['data' => $result]);
    }

    public function destroy($id): JsonResponse
    {
        $associado = Associado::find($id);

        if (!$associado) {
            return response()->json(['success' => false, 'message' => 'Associado não encontrado.'], 404);
        }

        $associado->delete();

        return response()->json([
            'success' => true,
            'message' => 'Associado excluído com sucesso.',
        ]);
    }

    private function buscarAlunoPorCpf(string $cpf): ?Aluno
    {
        $cpfLimpo = preg_replace('/\D/', '', $cpf);
        $cpfFormatado = preg_replace('/(\d{3})(\d{3})(\d{3})(\d{2})/', '$1.$2.$3-$4', $cpfLimpo);
        return Aluno::where('cpf_responsavel', $cpfLimpo)
            ->orWhere('cpf_responsavel', $cpfFormatado)
            ->first();
    }

    private function formatarNomesAlunos(Aluno $aluno): string
    {
        $cpfLimpo = preg_replace('/\D/', '', $aluno->cpf_responsavel);
        $cpfFormatado = preg_replace('/(\d{3})(\d{3})(\d{3})(\d{2})/', '$1.$2.$3-$4', $cpfLimpo);
        $alunos = Aluno::where('cpf_responsavel', $cpfLimpo)
            ->orWhere('cpf_responsavel', $cpfFormatado)
            ->get();
        return $alunos->map(fn ($a) => explode(' ', trim($a->nome))[0])->implode(' / ');
    }

    private function getAuthenticated(Request $request): ?Associado
    {
        $token = $request->bearerToken();
        if (!$token) return null;
        return Associado::where('api_token', $token)->first();
    }
}
