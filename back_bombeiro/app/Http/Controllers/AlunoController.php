<?php

namespace App\Http\Controllers;

use App\Models\Aluno;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlunoController extends Controller
{
    public function checkCpf(string $cpf, Request $request): JsonResponse
    {
        $query = Aluno::where('cpf', $cpf);
        if ($ignoreId = $request->query('ignore_id')) {
            $query->where('id', '!=', $ignoreId);
        }
        return response()->json(['exists' => $query->exists()]);
    }

    public function index()
    {
        return Aluno::orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:120',
            'cpf' => 'nullable|string|max:14|unique:alunos,cpf',
            'data_nascimento' => 'required|string|max:10',
            'telefone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'endereco' => 'nullable|string|max:200',
            'responsavel' => 'required|string|max:255',
            'cpf_responsavel' => 'nullable|string|max:14',
            'telefone_responsavel' => 'nullable|string|max:20',
            'turma' => 'required|string|max:50',
            'status' => 'required|in:ativo,inativo',
            'situacao' => 'required|in:em_dia,em_atraso,inadimplente',
            'valor_mensalidade' => 'nullable|numeric|min:0',
            'dia_vencimento' => 'nullable|integer|min:1|max:31',
        ]);

        return Aluno::create($validated);
    }

    public function show(Aluno $aluno)
    {
        return $aluno->load('mensalidades');
    }

    public function update(Request $request, Aluno $aluno)
    {
        $validated = $request->validate([
            'nome' => 'sometimes|string|max:120',
            'cpf' => 'nullable|string|max:14|unique:alunos,cpf,' . $aluno->id,
            'data_nascimento' => 'sometimes|string|max:10',
            'telefone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'endereco' => 'nullable|string|max:200',
            'responsavel' => 'sometimes|string|max:255',
            'cpf_responsavel' => 'nullable|string|max:14',
            'telefone_responsavel' => 'nullable|string|max:20',
            'turma' => 'sometimes|string|max:50',
            'status' => 'sometimes|in:ativo,inativo',
            'situacao' => 'sometimes|in:em_dia,em_atraso,inadimplente',
            'valor_mensalidade' => 'nullable|numeric|min:0',
            'dia_vencimento' => 'nullable|integer|min:1|max:31',
        ]);

        $aluno->update($validated);
        return $aluno;
    }

    public function destroy(Aluno $aluno)
    {
        $aluno->delete();
        return response()->noContent();
    }
}
