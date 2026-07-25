<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Transaction;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    private function syncTransaction(Expense $expense): void
    {
        if ($expense->status === 'pago') {
            Transaction::updateOrCreate(
                [
                    'source_type' => 'expense',
                    'source_id' => $expense->id,
                ],
                [
                    'description' => $expense->descricao,
                    'amount' => $expense->valor,
                    'type' => 'saida',
                    'category_name' => $expense->category?->nome ?? 'Despesas',
                    'date' => $expense->data_pagamento ?? $expense->data_vencimento,
                ]
            );
        } else {
            Transaction::where('source_type', 'expense')
                ->where('source_id', $expense->id)
                ->delete();
        }
    }

    public function index()
    {
        return Expense::with('category')->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'descricao' => 'required|string|max:255',
            'valor' => 'required|numeric|min:0',
            'data_vencimento' => 'required|date',
            'data_pagamento' => 'nullable|date',
            'status' => 'required|in:pendente,pago,atrasado',
            'financial_category_id' => 'nullable|exists:financial_categories,id',
            'observacao' => 'nullable|string|max:500',
        ]);

        $expense = Expense::create($validated);
        $this->syncTransaction($expense);

        return $expense->load('category');
    }

    public function show(Expense $expense)
    {
        return $expense->load('category');
    }

    public function update(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'descricao' => 'sometimes|string|max:255',
            'valor' => 'sometimes|numeric|min:0',
            'data_vencimento' => 'sometimes|date',
            'data_pagamento' => 'nullable|date',
            'status' => 'sometimes|in:pendente,pago,atrasado',
            'financial_category_id' => 'nullable|exists:financial_categories,id',
            'observacao' => 'nullable|string|max:500',
        ]);

        $expense->update($validated);
        $this->syncTransaction($expense->fresh());

        return $expense->load('category');
    }

    public function destroy(Expense $expense)
    {
        Transaction::where('source_type', 'expense')
            ->where('source_id', $expense->id)
            ->delete();
        $expense->delete();
        return response()->noContent();
    }
}
