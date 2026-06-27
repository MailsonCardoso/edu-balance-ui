<?php

namespace App\Http\Controllers;

use App\Models\FinancialCategory;
use Illuminate\Http\Request;

class FinancialCategoryController extends Controller
{
    public function index()
    {
        return FinancialCategory::orderBy('nome')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:100',
            'tipo' => 'required|in:receita,despesa',
            'cor' => 'nullable|string|max:7',
        ]);

        return FinancialCategory::create($validated);
    }

    public function update(Request $request, FinancialCategory $financialCategory)
    {
        $validated = $request->validate([
            'nome' => 'sometimes|string|max:100',
            'tipo' => 'sometimes|in:receita,despesa',
            'cor' => 'nullable|string|max:7',
        ]);

        $financialCategory->update($validated);
        return $financialCategory;
    }

    public function destroy(FinancialCategory $financialCategory)
    {
        $financialCategory->delete();
        return response()->noContent();
    }
}
