<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FuncionarioController extends Controller
{
    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user() && $request->user()->role === 'admin', 403, 'Acesso restrito ao administrador.');
    }

    private function senhaInicialDoCpf(string $cpf): string
    {
        $digits = preg_replace('/\D/', '', $cpf);

        return substr($digits, 0, 6) ?: '123456';
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        return response()->json(User::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:255|unique:users,email',
            'cpf' => 'required|string|max:14|unique:users,cpf',
            'telefone' => 'nullable|string|max:20',
            'role' => 'required|in:admin,secretaria',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'cpf' => preg_replace('/\D/', '', $validated['cpf']),
            'telefone' => $validated['telefone'],
            'role' => $validated['role'],
            'password' => $this->senhaInicialDoCpf($validated['cpf']),
            'must_change_password' => true,
        ]);

        return response()->json($user, 201);
    }

    public function show(Request $request, User $funcionario): JsonResponse
    {
        $this->authorizeAdmin($request);

        return response()->json($funcionario);
    }

    public function update(Request $request, User $funcionario): JsonResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:120',
            'email' => 'sometimes|email|max:255|unique:users,email,' . $funcionario->id,
            'cpf' => 'sometimes|string|max:14|unique:users,cpf,' . $funcionario->id,
            'telefone' => 'nullable|string|max:20',
            'role' => 'sometimes|in:admin,secretaria',
            'password' => 'nullable|string|min:6',
            'must_change_password' => 'nullable|boolean',
        ]);

        $data = [
            'name' => $validated['name'] ?? $funcionario->name,
            'email' => isset($validated['email']) ? strtolower($validated['email']) : $funcionario->email,
            'cpf' => isset($validated['cpf']) ? preg_replace('/\D/', '', $validated['cpf']) : $funcionario->cpf,
            'telefone' => $validated['telefone'] ?? $funcionario->telefone,
            'role' => $validated['role'] ?? $funcionario->role,
        ];

        if (!empty($validated['password'])) {
            $data['password'] = $validated['password'];
            $data['must_change_password'] = $validated['must_change_password'] ?? false;
        } elseif (array_key_exists('must_change_password', $validated)) {
            $data['must_change_password'] = $validated['must_change_password'];
        }

        if ($request->user()->id === $funcionario->id) {
            unset($data['role']);
        }

        $funcionario->update($data);

        return response()->json($funcionario);
    }

    public function destroy(Request $request, User $funcionario)
    {
        $this->authorizeAdmin($request);

        if ($request->user()->id === $funcionario->id) {
            abort(422, 'Você não pode excluir o próprio usuário.');
        }

        $funcionario->delete();

        return response()->noContent();
    }
}