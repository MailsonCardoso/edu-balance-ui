<?php

namespace App\Http\Controllers;

use App\Models\Revenue;
use Illuminate\Http\Request;

class RevenueController extends Controller
{
    public function index()
    {
        return Revenue::with('category')->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'descricao' => 'required|string|max:255',
            'valor' => 'required|numeric|min:0',
            'data' => 'required|date',
            'data_recebimento' => 'nullable|date',
            'status' => 'required|in:pendente,recebido',
            'financial_category_id' => 'nullable|exists:financial_categories,id',
            'observacao' => 'nullable|string|max:500',
        ]);

        return Revenue::create($validated)->load('category');
    }

    public function show(Revenue $revenue)
    {
        return $revenue->load('category');
    }

    public function update(Request $request, Revenue $revenue)
    {
        $validated = $request->validate([
            'descricao' => 'sometimes|string|max:255',
            'valor' => 'sometimes|numeric|min:0',
            'data' => 'sometimes|date',
            'data_recebimento' => 'nullable|date',
            'status' => 'sometimes|in:pendente,recebido',
            'financial_category_id' => 'nullable|exists:financial_categories,id',
            'observacao' => 'nullable|string|max:500',
        ]);

        $revenue->update($validated);
        return $revenue->load('category');
    }

    public function destroy(Revenue $revenue)
    {
        $revenue->delete();
        return response()->noContent();
    }
}
