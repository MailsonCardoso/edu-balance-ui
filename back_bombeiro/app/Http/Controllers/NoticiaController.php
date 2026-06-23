<?php

namespace App\Http\Controllers;

use App\Models\Noticia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoticiaController extends Controller
{
    public function index(): JsonResponse
    {
        $noticias = Noticia::orderBy('created_at', 'desc')->get()->map(fn ($item) => [
            'id' => $item->id,
            'title' => $item->title,
            'summary' => $item->summary,
            'content' => $item->content,
            'category' => $item->category,
            'image' => $item->image,
            'author' => $item->author,
            'status' => $item->status,
            'published_at' => $item->published_at?->format('d/m/Y'),
            'created_at' => $item->created_at->format('d/m/Y H:i'),
        ]);

        return response()->json(['data' => $noticias]);
    }

    public function show(Noticia $noticia): JsonResponse
    {
        return response()->json($noticia);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string',
            'content' => 'nullable|string',
            'category' => 'required|string|max:255',
            'image' => 'nullable|string|max:500',
            'author' => 'nullable|string|max:255',
            'status' => 'sometimes|in:rascunho,publicado',
            'published_at' => 'nullable|date',
        ]);

        if (!isset($validated['published_at']) && ($validated['status'] ?? 'publicado') === 'publicado') {
            $validated['published_at'] = now();
        }

        $noticia = Noticia::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Notícia criada com sucesso.',
            'data' => $noticia,
        ], 201);
    }

    public function update(Request $request, Noticia $noticia): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'summary' => 'nullable|string',
            'content' => 'nullable|string',
            'category' => 'sometimes|string|max:255',
            'image' => 'nullable|string|max:500',
            'author' => 'nullable|string|max:255',
            'status' => 'sometimes|in:rascunho,publicado',
            'published_at' => 'nullable|date',
        ]);

        if (!isset($validated['published_at']) && ($validated['status'] ?? $noticia->status) === 'publicado' && !$noticia->published_at) {
            $validated['published_at'] = now();
        }

        $noticia->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Notícia atualizada com sucesso.',
        ]);
    }

    public function destroy(Noticia $noticia): JsonResponse
    {
        $noticia->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notícia excluída com sucesso.',
        ]);
    }

    public function publicas(): JsonResponse
    {
        $noticias = Noticia::where('status', 'publicado')
            ->whereNotNull('published_at')
            ->orderBy('published_at', 'desc')
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id,
                'title' => $item->title,
                'summary' => $item->summary,
                'category' => $item->category,
                'image' => $item->image,
                'published_at' => $item->published_at->format('d/m/Y'),
            ]);

        return response()->json(['data' => $noticias]);
    }
}
