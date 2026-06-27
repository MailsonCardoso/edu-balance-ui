<?php

namespace App\Http\Controllers;

use App\Models\FinancialCategory;
use Illuminate\Http\Request;

class FinancialCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = FinancialCategory::query();

        if ($request->tipo) {
            $query->where('tipo', $request->tipo);
        }

        return response()->json($query->orderBy('nome')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'tipo' => 'required|in:receita,despesa',
            'cor' => 'nullable|string|max:7',
            'icone' => 'nullable|string|max:50',
        ]);

        $category = FinancialCategory::create($data);

        return response()->json($category, 201);
    }

    public function update(Request $request, FinancialCategory $financialCategory)
    {
        $data = $request->validate([
            'nome' => 'sometimes|string|max:255',
            'tipo' => 'sometimes|in:receita,despesa',
            'cor' => 'nullable|string|max:7',
            'icone' => 'nullable|string|max:50',
            'ativo' => 'sometimes|boolean',
        ]);

        $financialCategory->update($data);

        return response()->json($financialCategory);
    }

    public function destroy(FinancialCategory $financialCategory)
    {
        $financialCategory->delete();

        return response()->json(['message' => 'Categoria removida']);
    }
}
