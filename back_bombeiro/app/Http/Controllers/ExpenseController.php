<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::with(['category', 'costCenter', 'user']);

        if ($request->data_inicio) {
            $query->where('data', '>=', $request->data_inicio);
        }
        if ($request->data_fim) {
            $query->where('data', '<=', $request->data_fim);
        }
        if ($request->category_id) {
            $query->where('financial_category_id', $request->category_id);
        }
        if ($request->forma_pagamento) {
            $query->where('forma_pagamento', $request->forma_pagamento);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderBy('data', 'desc')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'data' => 'required|date',
            'financial_category_id' => 'required|exists:financial_categories,id',
            'descricao' => 'required|string|max:255',
            'fornecedor' => 'nullable|string|max:255',
            'valor' => 'required|numeric|min:0',
            'forma_pagamento' => 'nullable|string|max:50',
            'data_vencimento' => 'nullable|date',
            'data_pagamento' => 'nullable|date',
            'status' => 'sometimes|in:pendente,pago,atrasado,cancelado',
            'cost_center_id' => 'nullable|exists:cost_centers,id',
            'comprovante' => 'nullable|string',
            'observacoes' => 'nullable|string',
        ]);

        $data['user_id'] = $request->user()->id;

        $expense = Expense::create($data);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'acao' => 'created',
            'entidade' => 'expense',
            'entidade_id' => (string) $expense->id,
            'valores_novos' => $data,
            'ip' => $request->ip(),
        ]);

        return response()->json($expense->load(['category', 'costCenter', 'user']), 201);
    }

    public function show(Expense $expense)
    {
        return response()->json($expense->load(['category', 'costCenter', 'user']));
    }

    public function update(Request $request, Expense $expense)
    {
        $data = $request->validate([
            'data' => 'sometimes|date',
            'financial_category_id' => 'sometimes|exists:financial_categories,id',
            'descricao' => 'sometimes|string|max:255',
            'fornecedor' => 'nullable|string|max:255',
            'valor' => 'sometimes|numeric|min:0',
            'forma_pagamento' => 'nullable|string|max:50',
            'data_vencimento' => 'nullable|date',
            'data_pagamento' => 'nullable|date',
            'status' => 'sometimes|in:pendente,pago,atrasado,cancelado',
            'cost_center_id' => 'nullable|exists:cost_centers,id',
            'comprovante' => 'nullable|string',
            'observacoes' => 'nullable|string',
        ]);

        $anteriores = $expense->toArray();
        $expense->update($data);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'acao' => 'updated',
            'entidade' => 'expense',
            'entidade_id' => (string) $expense->id,
            'valores_anteriores' => $anteriores,
            'valores_novos' => $expense->toArray(),
            'ip' => $request->ip(),
        ]);

        return response()->json($expense->load(['category', 'costCenter', 'user']));
    }

    public function destroy(Request $request, Expense $expense)
    {
        AuditLog::create([
            'user_id' => $request->user()->id,
            'acao' => 'deleted',
            'entidade' => 'expense',
            'entidade_id' => (string) $expense->id,
            'valores_anteriores' => $expense->toArray(),
            'ip' => $request->ip(),
        ]);

        $expense->delete();

        return response()->json(['message' => 'Despesa removida']);
    }

    public function pagar(Request $request, Expense $expense)
    {
        $data = $request->validate([
            'data_pagamento' => 'required|date',
            'forma_pagamento' => 'nullable|string|max:50',
        ]);

        $anteriores = $expense->toArray();
        $expense->update([
            'status' => 'pago',
            'data_pagamento' => $data['data_pagamento'],
            'forma_pagamento' => $data['forma_pagamento'] ?? $expense->forma_pagamento,
        ]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'acao' => 'updated',
            'entidade' => 'expense',
            'entidade_id' => (string) $expense->id,
            'valores_anteriores' => $anteriores,
            'valores_novos' => $expense->toArray(),
            'ip' => $request->ip(),
        ]);

        return response()->json($expense->load(['category', 'costCenter', 'user']));
    }

    public function estornar(Request $request, Expense $expense)
    {
        $anteriores = $expense->toArray();
        $expense->update([
            'status' => 'pendente',
            'data_pagamento' => null,
        ]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'acao' => 'updated',
            'entidade' => 'expense',
            'entidade_id' => (string) $expense->id,
            'valores_anteriores' => $anteriores,
            'valores_novos' => $expense->toArray(),
            'ip' => $request->ip(),
        ]);

        return response()->json($expense->load(['category', 'costCenter', 'user']));
    }
}
