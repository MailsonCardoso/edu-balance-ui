<?php

namespace App\Http\Controllers;

use App\Models\PagamentoTransacao;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditoriaController extends Controller
{
    public function pagamentos(Request $request): JsonResponse
    {
        $query = PagamentoTransacao::with([
            'mensalidade.aluno:id,nome,cpf,responsavel,cpf_responsavel',
        ])->orderBy('created_at', 'desc');

        if ($request->filled('data_inicio')) {
            $query->whereDate('created_at', '>=', $request->data_inicio);
        }

        if ($request->filled('data_fim')) {
            $query->whereDate('created_at', '<=', $request->data_fim);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('mensalidade.aluno', function ($q) use ($search) {
                $q->where('nome', 'like', "%{$search}%")
                  ->orWhere('cpf', 'like', "%{$search}%")
                  ->orWhere('responsavel', 'like', "%{$search}%")
                  ->orWhere('cpf_responsavel', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) $request->per_page ?: 50, 200);
        $pagamentos = $query->paginate($perPage);

        $pagamentos->getCollection()->transform(function ($t) {
            $payload = $t->payload_response ?? $t->payload_request ?? [];
            $e2eId = $payload['point_of_interaction']['transaction_data']['e2e_id'] ?? null;
            $issuerId = $payload['payment_method']['issuer_id'] ?? null;

            return [
                'id' => $t->id,
                'payment_id' => $t->payment_id,
                'external_reference' => $t->external_reference,
                'status' => $t->status,
                'payment_method' => $t->payment_method,
                'payer_email' => $t->payer_email,
                'data_criacao' => $payload['date_created'] ?? $t->created_at,
                'data_aprovacao' => $payload['date_approved'] ?? $t->data_aprovacao,
                'issuer_id' => $issuerId,
                'banco_nome' => self::getNomeBanco($issuerId),
                'e2e_id' => $e2eId,
                'aluno_nome' => $t->mensalidade?->aluno?->nome,
                'aluno_cpf' => $t->mensalidade?->aluno?->cpf,
                'responsavel' => $t->mensalidade?->aluno?->responsavel,
                'cpf_responsavel' => $t->mensalidade?->aluno?->cpf_responsavel,
                'mes_referencia' => $t->mensalidade?->mes_referencia,
                'valor' => $t->mensalidade?->valor,
                'mensalidade_status' => $t->mensalidade?->status,
            ];
        });

        return response()->json($pagamentos);
    }

    private static function getNomeBanco(?string $issuerId): ?string
    {
        $bancos = [
            '12501' => 'NU Pagamentos (Nubank)',
            '105'   => 'Banco do Brasil',
            '104'   => 'Caixa Econômica Federal',
            '341'   => 'Itaú Unibanco',
            '237'   => 'Bradesco',
            '33'    => 'Santander',
            '260'   => 'Nubank',
            '212'   => 'Banco Inter',
            '77'    => 'Banco Inter',
            '336'   => 'C6 Bank',
            '655'   => 'Neon',
            '208'   => 'PicPay',
            '290'   => 'PagBank',
            '117'   => 'PagBank',
            '323'   => 'Mercado Pago',
            '756'   => 'Sicoob',
            '748'   => 'Sicredi',
            '422'   => 'Safra',
            '389'   => 'Banco do Nordeste',
            '707'   => 'Banco Digital',
            '1'     => 'Mercado Pago',
        ];

        return $bancos[$issuerId] ?? "Código {$issuerId}";
    }
}
