<?php

namespace App\Http\Controllers;

use App\Models\Documento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Documento::orderBy('created_at', 'desc');

        if ($request->filled('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        $documentos = $query->get()->map(fn ($item) => [
            'id' => $item->id,
            'titulo' => $item->titulo,
            'arquivo' => $item->arquivo,
            'tipo' => $item->tipo,
            'url' => url('storage/' . $item->arquivo),
            'created_at' => $item->created_at->format('d/m/Y'),
        ]);

        return response()->json(['data' => $documentos]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'tipo' => 'required|in:estatuto,transparencia',
            'arquivo' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,zip|max:51200',
        ]);

        if ($validated['tipo'] === 'estatuto') {
            $existing = Documento::where('tipo', 'estatuto')->first();
            if ($existing) {
                Storage::disk('public')->delete($existing->arquivo);
                $existing->delete();
            }
        }

        $path = $request->file('arquivo')->store('documentos', 'public');

        $documento = Documento::create([
            'titulo' => $validated['titulo'],
            'arquivo' => $path,
            'tipo' => $validated['tipo'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Documento enviado com sucesso.',
            'data' => [
                'id' => $documento->id,
                'titulo' => $documento->titulo,
                'arquivo' => $documento->arquivo,
                'url' => url('storage/' . $documento->arquivo),
            ],
        ], 201);
    }

    public function update(Request $request, Documento $documento): JsonResponse
    {
        $validated = $request->validate([
            'titulo' => 'sometimes|string|max:255',
            'arquivo' => 'sometimes|file|mimes:pdf,doc,docx,xls,xlsx,zip|max:51200',
        ]);

        if ($request->hasFile('arquivo')) {
            Storage::disk('public')->delete($documento->arquivo);
            $path = $request->file('arquivo')->store('documentos', 'public');
            $validated['arquivo'] = $path;
        }

        $documento->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Documento atualizado com sucesso.',
        ]);
    }

    public function destroy(Documento $documento): JsonResponse
    {
        Storage::disk('public')->delete($documento->arquivo);
        $documento->delete();

        return response()->json([
            'success' => true,
            'message' => 'Documento excluído com sucesso.',
        ]);
    }
}
