<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    public function index(): JsonResponse
    {
        $categorias = Categoria::orderBy('name')->get()->map(fn ($item) => [
            'id' => $item->id,
            'name' => $item->name,
        ]);

        return response()->json(['data' => $categorias]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categorias,name',
        ]);

        $categoria = Categoria::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Categoria criada com sucesso.',
            'data' => $categoria,
        ], 201);
    }

    public function update(Request $request, Categoria $categoria): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categorias,name,' . $categoria->id,
        ]);

        $categoria->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Categoria atualizada com sucesso.',
        ]);
    }

    public function destroy(Categoria $categoria): JsonResponse
    {
        $categoria->delete();

        return response()->json([
            'success' => true,
            'message' => 'Categoria excluída com sucesso.',
        ]);
    }
}
