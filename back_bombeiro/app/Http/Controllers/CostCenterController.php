<?php

namespace App\Http\Controllers;

use App\Models\CostCenter;
use Illuminate\Http\Request;

class CostCenterController extends Controller
{
    public function index()
    {
        return response()->json(CostCenter::orderBy('nome')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'codigo' => 'required|string|max:20|unique:cost_centers',
            'descricao' => 'nullable|string',
        ]);

        $center = CostCenter::create($data);

        return response()->json($center, 201);
    }

    public function update(Request $request, CostCenter $costCenter)
    {
        $data = $request->validate([
            'nome' => 'sometimes|string|max:255',
            'codigo' => 'sometimes|string|max:20|unique:cost_centers,codigo,' . $costCenter->id,
            'descricao' => 'nullable|string',
            'ativo' => 'sometimes|boolean',
        ]);

        $costCenter->update($data);

        return response()->json($costCenter);
    }

    public function destroy(CostCenter $costCenter)
    {
        $costCenter->delete();

        return response()->json(['message' => 'Centro de custo removido']);
    }
}
