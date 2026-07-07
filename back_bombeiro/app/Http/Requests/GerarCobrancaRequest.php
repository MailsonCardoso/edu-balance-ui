<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GerarCobrancaRequest extends FormRequest
{
    public function authorize(): bool
    {
        $token = $this->bearerToken();
        if (!$token) {
            return false;
        }

        $associado = \App\Models\Associado::where('api_token', $token)->first();
        if (!$associado) {
            return false;
        }

        $mensalidade = $this->route('mensalidade');
        if (!$mensalidade) {
            return false;
        }

        $alunos = \App\Models\Aluno::where('cpf_responsavel', preg_replace('/\D/', '', $associado->cpf))
            ->orWhere('cpf_responsavel', $associado->cpf)
            ->pluck('id')
            ->toArray();

        return in_array($mensalidade->aluno_id, $alunos);
    }

    public function rules(): array
    {
        return [];
    }
}
