<?php

namespace App\Http\Controllers;

use App\Models\Patrimonio;
use Illuminate\Http\Request;

class PatrimonioController extends Controller
{
    public function index()
    {
        return Patrimonio::orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tag' => 'required|string|max:50|unique:patrimonios,tag',
            'nome' => 'required|string|max:255',
            'numeroSerie' => 'nullable|string|max:100',
            'categoria' => 'required|in:TI,Mobiliário,Veículos,Eletrodoméstico,Imóvel,Outros',
            'localizacao' => 'required|in:Sede,Filial,Home Office,Depósito',
            'responsavel' => 'required|string|max:255',
            'setor' => 'required|string|max:255',
            'valorCompra' => 'required|numeric|min:0',
            'valorDepreciado' => 'required|numeric|min:0',
            'dataCompra' => 'required|date',
            'dataUltimaAuditoria' => 'nullable|date',
            'status' => 'required|in:ativo,em_manutencao,baixado,emprestado',
            'observacao' => 'nullable|string|max:1000',
        ]);

        return Patrimonio::create($validated);
    }

    public function show(Patrimonio $patrimonio)
    {
        return $patrimonio;
    }

    public function update(Request $request, Patrimonio $patrimonio)
    {
        $validated = $request->validate([
            'tag' => 'sometimes|string|max:50|unique:patrimonios,tag,' . $patrimonio->id,
            'nome' => 'sometimes|string|max:255',
            'numeroSerie' => 'nullable|string|max:100',
            'categoria' => 'sometimes|in:TI,Mobiliário,Veículos,Eletrodoméstico,Imóvel,Outros',
            'localizacao' => 'sometimes|in:Sede,Filial,Home Office,Depósito',
            'responsavel' => 'sometimes|string|max:255',
            'setor' => 'sometimes|string|max:255',
            'valorCompra' => 'sometimes|numeric|min:0',
            'valorDepreciado' => 'sometimes|numeric|min:0',
            'dataCompra' => 'sometimes|date',
            'dataUltimaAuditoria' => 'nullable|date',
            'status' => 'sometimes|in:ativo,em_manutencao,baixado,emprestado',
            'observacao' => 'nullable|string|max:1000',
        ]);

        $patrimonio->update($validated);
        return $patrimonio;
    }

    public function destroy(Patrimonio $patrimonio)
    {
        $patrimonio->delete();
        return response()->noContent();
    }
}
