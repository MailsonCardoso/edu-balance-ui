<?php

namespace App\Http\Controllers;

use App\Models\Revenue;
use App\Models\Transaction;
use Illuminate\Http\Request;

class RevenueController extends Controller
{
    private function syncTransaction(Revenue $revenue): void
    {
        if ($revenue->status === 'recebido') {
            Transaction::updateOrCreate(
                [
                    'source_type' => 'revenue',
                    'source_id' => $revenue->id,
                ],
                [
                    'description' => $revenue->descricao,
                    'amount' => $revenue->valor,
                    'type' => 'entrada',
                    'category_name' => $revenue->category?->nome ?? 'Receitas',
                    'date' => $revenue->data_recebimento ?? $revenue->data,
                ]
            );
        } else {
            Transaction::where('source_type', 'revenue')
                ->where('source_id', $revenue->id)
                ->delete();
        }
    }

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

        $revenue = Revenue::create($validated);
        $this->syncTransaction($revenue);

        return $revenue->load('category');
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
        $this->syncTransaction($revenue->fresh());

        return $revenue->load('category');
    }

    public function destroy(Revenue $revenue)
    {
        Transaction::where('source_type', 'revenue')
            ->where('source_id', $revenue->id)
            ->delete();
        $revenue->delete();
        return response()->noContent();
    }
}
