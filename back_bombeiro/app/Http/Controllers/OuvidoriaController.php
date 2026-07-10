<?php

namespace App\Http\Controllers;

use App\Models\Ouvidoria;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OuvidoriaController extends Controller
{
    public function index(): JsonResponse
    {
        $ouvidorias = Ouvidoria::orderBy('created_at', 'desc')->get()->map(fn ($item) => [
            'id' => $item->id,
            'protocolo' => $item->protocolo,
            'tipo' => $item->tipo,
            'mensagem' => $item->mensagem,
            'descricao' => $item->descricao,
            'anonimo' => $item->anonimo,
            'nome' => $item->anonimo ? null : $item->nome,
            'email' => $item->anonimo ? null : $item->email,
            'status' => $item->status,
            'created_at' => $item->created_at->format('d/m/Y H:i'),
        ]);

        return response()->json(['data' => $ouvidorias]);
    }

    public function show(string $protocolo): JsonResponse
    {
        $ouvidoria = Ouvidoria::where('protocolo', $protocolo)->first();

        if (!$ouvidoria) {
            return response()->json(['message' => 'Protocolo não encontrado.'], 404);
        }

        return response()->json([
            'id' => $ouvidoria->id,
            'protocolo' => $ouvidoria->protocolo,
            'tipo' => $ouvidoria->tipo,
            'mensagem' => $ouvidoria->mensagem,
            'descricao' => $ouvidoria->descricao,
            'status' => $ouvidoria->status,
            'created_at' => $ouvidoria->created_at->format('d/m/Y H:i'),
        ]);
    }

    public function update(Request $request, Ouvidoria $ouvidoria): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:pendente,em_andamento,respondido',
            'descricao' => 'sometimes|nullable|string',
        ]);

        $ouvidoria->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Status atualizado com sucesso.',
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nome' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'tipo' => 'required|in:sugestao,reclamacao,denuncia,elogio,outro',
            'mensagem' => 'required|string|min:10',
            'anonimo' => 'boolean',
        ]);

        $validated['anonimo'] = $request->boolean('anonimo');
        $validated['protocolo'] = $this->gerarProtocolo();
        $validated['status'] = 'pendente';

        $ouvidoria = Ouvidoria::create($validated);

        return response()->json([
            'success' => true,
            'protocolo' => $ouvidoria->protocolo,
            'message' => 'Manifestação registrada com sucesso.',
        ], 201);
    }

    public function destroy(Ouvidoria $ouvidoria): JsonResponse
    {
        $ouvidoria->delete();

        return response()->json([
            'success' => true,
            'message' => 'Manifestação excluída com sucesso.',
        ]);
    }

    private function gerarProtocolo(): string
    {
        $ano = now()->format('Y');
        $ultimo = Ouvidoria::whereYear('created_at', $ano)
            ->lockForUpdate()
            ->count();

        return sprintf('OUV-%s-%04d', $ano, $ultimo + 1);
    }
}
