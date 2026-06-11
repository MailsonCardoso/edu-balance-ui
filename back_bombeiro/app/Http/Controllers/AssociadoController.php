<?php

namespace App\Http\Controllers;

use App\Models\Associado;
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

        return response()->json([
            'success' => true,
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

    private function getAuthenticated(Request $request): ?Associado
    {
        $token = $request->bearerToken();
        if (!$token) return null;
        return Associado::where('api_token', $token)->first();
    }
}
