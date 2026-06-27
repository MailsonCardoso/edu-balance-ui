<?php

namespace App\Http\Controllers;

use App\Models\Revenue;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class RevenueController extends Controller
{
    public function index(Request $request)
    {
        $query = Revenue::with(['category', 'costCenter', 'user']);

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
            'valor' => 'required|numeric|min:0',
            'forma_pagamento' => 'nullable|string|max:50',
            'cost_center_id' => 'nullable|exists:cost_centers,id',
            'comprovante' => 'nullable|string',
            'observacoes' => 'nullable|string',
            'status' => 'sometimes|in:recebido,pendente,cancelado',
            'data_recebimento' => 'nullable|date',
        ]);

        $data['user_id'] = $request->user()->id;
        $data['origem'] = 'manual';
        $data['status'] = $data['status'] ?? 'recebido';
        $data['data_recebimento'] = $data['data_recebimento'] ?? $data['data'];

        $revenue = Revenue::create($data);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'acao' => 'created',
            'entidade' => 'revenue',
            'entidade_id' => (string) $revenue->id,
            'valores_novos' => $data,
            'ip' => $request->ip(),
        ]);

        return response()->json($revenue->load(['category', 'costCenter', 'user']), 201);
    }

    public function show(Revenue $revenue)
    {
        return response()->json($revenue->load(['category', 'costCenter', 'user']));
    }

    public function update(Request $request, Revenue $revenue)
    {
        $data = $request->validate([
            'data' => 'sometimes|date',
            'financial_category_id' => 'sometimes|exists:financial_categories,id',
            'descricao' => 'sometimes|string|max:255',
            'valor' => 'sometimes|numeric|min:0',
            'forma_pagamento' => 'nullable|string|max:50',
            'cost_center_id' => 'nullable|exists:cost_centers,id',
            'comprovante' => 'nullable|string',
            'observacoes' => 'nullable|string',
            'status' => 'sometimes|in:recebido,pendente,cancelado',
            'data_recebimento' => 'nullable|date',
        ]);

        $anteriores = $revenue->toArray();
        $revenue->update($data);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'acao' => 'updated',
            'entidade' => 'revenue',
            'entidade_id' => (string) $revenue->id,
            'valores_anteriores' => $anteriores,
            'valores_novos' => $revenue->toArray(),
            'ip' => $request->ip(),
        ]);

        return response()->json($revenue->load(['category', 'costCenter', 'user']));
    }

    public function destroy(Request $request, Revenue $revenue)
    {
        AuditLog::create([
            'user_id' => $request->user()->id,
            'acao' => 'deleted',
            'entidade' => 'revenue',
            'entidade_id' => (string) $revenue->id,
            'valores_anteriores' => $revenue->toArray(),
            'ip' => $request->ip(),
        ]);

        $revenue->delete();

        return response()->json(['message' => 'Entrada removida']);
    }
}
