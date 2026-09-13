<?php

namespace App\Services;

use App\DTOs\AtualizarStatusDTO;
use App\DTOs\GerarCobrancaDTO;
use App\Enums\MensalidadeStatus;
use App\Enums\MercadoPagoStatus;
use App\Enums\PagamentoOrigem;
use App\Events\MensalidadeStatusUpdated;
use App\Models\FinancialCategory;
use App\Models\Mensalidade;
use App\Models\MonthlyClosure;
use App\Models\PagamentoTransacao;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PagamentoService
{
    private const TAXA_PIX_MERCADOPAGO = 0.59;

    public function __construct(
        private readonly MercadoPagoService $mercadopago,
    ) {}

    public function gerarCobranca(Mensalidade $mensalidade, string $formaPagamento = 'pix'): PagamentoTransacao
    {
        if ($mensalidade->isPago()) {
            throw new \RuntimeException('Mensalidade já está paga.');
        }

        $dto = GerarCobrancaDTO::fromMensalidade(
            $mensalidade,
            config('services.mercadopago.notification_url', ''),
            $formaPagamento,
        );

        $pagamento = $this->mercadopago->criarCobranca($dto);

        $paymentId = $pagamento['id'] ?? null;
        $paymentUrl = $pagamento['point_of_interaction']['transaction_data']['ticket_url']
            ?? $pagamento['transaction_details']['external_resource_url']
            ?? null;

        if (empty($paymentUrl) && $paymentId) {
            $pagamento = $this->mercadopago->consultarPagamento((string) $paymentId);
            $paymentUrl = $pagamento['transaction_details']['external_resource_url']
                ?? $pagamento['point_of_interaction']['transaction_data']['ticket_url']
                ?? null;
        }

        if (($pagamento['status'] ?? '') === 'rejected') {
            $detail = $pagamento['status_detail'] ?? 'rejected_by_bank';
            throw new \RuntimeException("Boleto rejeitado pelo banco ({$detail}). Verifique os dados do pagador.");
        }

        return DB::transaction(function () use ($mensalidade, $dto, $pagamento, $paymentUrl) {
            $transacao = PagamentoTransacao::create([
                'mensalidade_id' => $mensalidade->id,
                'payment_id' => $pagamento['id'] ?? null,
                'external_reference' => $dto->externalReference,
                'origem' => PagamentoOrigem::MercadoPago->value,
                'status' => $pagamento['status'] ?? MercadoPagoStatus::Pending->value,
                'payment_url' => $paymentUrl,
                'payload_request' => $pagamento,
                'notification_url' => $dto->notificationUrl,
            ]);

            Log::info('Pagamento: Cobranca gerada (PIX)', [
                'mensalidade_id' => $mensalidade->id,
                'transacao_id' => $transacao->id,
                'payment_id' => $pagamento['id'] ?? null,
                'external_reference' => $dto->externalReference,
            ]);

            return $transacao;
        });
    }

    public function processarNotificacaoWebhook(string $paymentId, array $payloadWebhook): void
    {
        Log::info('Pagamento: Processando webhook', [
            'payment_id' => $paymentId,
        ]);

        $dadosAtuais = $this->mercadopago->consultarPagamento($paymentId);
        $dto = AtualizarStatusDTO::fromMercadoPagoResponse($dadosAtuais);

        DB::transaction(function () use ($dto, $dadosAtuais, $payloadWebhook, $paymentId) {
            $transacao = PagamentoTransacao::where('payment_id', $paymentId)
                ->orWhere('external_reference', $dadosAtuais['external_reference'] ?? '')
                ->first();

            if (!$transacao && !empty($dadosAtuais['external_reference'])) {
                $transacao = $this->criarTransacaoDeWebhook($dadosAtuais);
            }

            if (!$transacao) {
                Log::warning('Pagamento: Transacao nao encontrada para webhook', [
                    'payment_id' => $paymentId,
                    'external_reference' => $dadosAtuais['external_reference'] ?? null,
                ]);
                return;
            }

            $statusAnterior = $transacao->status;

            if ($statusAnterior === $dto->status) {
                Log::info('Pagamento: Status ja atualizado, ignorando', [
                    'transacao_id' => $transacao->id,
                    'status' => $dto->status,
                ]);
                return;
            }

            $transacao->update([
                'payment_id' => $dto->paymentId ?: $transacao->payment_id,
                'status' => $dto->status,
                'payment_method' => $dto->paymentMethod ?? $transacao->payment_method,
                'payer_email' => $dto->payerEmail ?? $transacao->payer_email,
                'data_aprovacao' => $dto->aprovadoEm ?? $transacao->data_aprovacao,
                'payload_response' => $dto->respostaApi,
            ]);

            $mensalidadeStatus = MercadoPagoStatus::tryFrom($dto->status)?->mensalidadeStatus();
            $statusAnteriorMensalidade = $transacao->mensalidade->status;

            if ($mensalidadeStatus && $statusAnteriorMensalidade !== $mensalidadeStatus->value) {
                $dadosAtualizacao = [
                    'status' => $mensalidadeStatus->value,
                ];

                if ($dto->status === MercadoPagoStatus::Approved->value) {
                    $dadosAtualizacao['data_pagamento'] = now();
                    $formaPagamento = $this->mapearFormaPagamento($dto->paymentMethod);
                    $dadosAtualizacao['forma_pagamento'] = $formaPagamento;
                    $dadosAtualizacao['origem'] = PagamentoOrigem::MercadoPago->value;

                    $valorCobrado = (float) ($dadosAtuais['transaction_amount']
                        ?? $transacao->mensalidade->valor_cobrado
                        ?? $transacao->mensalidade->valor);
                    $dadosAtualizacao['valor_cobrado'] = $valorCobrado;

                    if ($formaPagamento === 'pix') {
                        $dadosAtualizacao['valor'] = max(0, round($valorCobrado - self::TAXA_PIX_MERCADOPAGO, 2));
                    } else {
                        $dadosAtualizacao['valor'] = $valorCobrado;
                    }
                }

                $transacao->mensalidade->update($dadosAtualizacao);

                if ($mensalidadeStatus?->value === MensalidadeStatus::Pago->value) {
                    $this->sincronizarMensalidadeNoCaixa(
                        $transacao->mensalidade->refresh()->loadMissing('aluno'),
                    );
                }
            }

            event(new MensalidadeStatusUpdated(
                mensalidade: $transacao->mensalidade,
                statusAnterior: $statusAnteriorMensalidade,
                novoStatus: $mensalidadeStatus?->value ?? $dto->status,
                paymentId: $dto->paymentId,
                externalReference: $transacao->external_reference,
                payloadWebhook: $payloadWebhook,
                respostaApi: $dto->respostaApi,
                transacaoId: $transacao->id,
            ));

            Log::info('Pagamento: Status atualizado via webhook', [
                'transacao_id' => $transacao->id,
                'status_anterior' => $statusAnterior,
                'novo_status' => $dto->status,
                'mensalidade_id' => $transacao->mensalidade_id,
            ]);
        });
    }

    private function criarTransacaoDeWebhook(array $dadosMP): ?PagamentoTransacao
    {
        $externalReference = $dadosMP['external_reference'] ?? null;
        if (!$externalReference) {
            return null;
        }

        preg_match('/MENSALIDADE_(\d+)_/', $externalReference, $matches);
        $mensalidadeId = $matches[1] ?? null;

        if (!$mensalidadeId) {
            return null;
        }

        $mensalidade = Mensalidade::find($mensalidadeId);
        if (!$mensalidade) {
            return null;
        }

        return PagamentoTransacao::create([
            'mensalidade_id' => $mensalidade->id,
            'payment_id' => $dadosMP['id'] ?? null,
            'preference_id' => $dadosMP['preference_id'] ?? null,
            'external_reference' => $externalReference,
            'origem' => PagamentoOrigem::MercadoPago->value,
            'status' => $dadosMP['status'] ?? 'pending',
            'payment_method' => $dadosMP['payment_method']['type'] ?? null,
            'payer_email' => $dadosMP['payer']['email'] ?? null,
            'payload_response' => $dadosMP,
        ]);
    }

    private function mapearFormaPagamento(?string $paymentMethod): string
    {
        return match ($paymentMethod) {
            'pix' => 'pix',
            'ticket', 'boleto' => 'debito',
            default => 'pix',
        };
    }

    public function sincronizarMensalidadeNoCaixa(Mensalidade $mensalidade): void
    {
        if (!$mensalidade->isPago()) {
            return;
        }

        $dataPagamento = $mensalidade->data_pagamento?->format('Y-m-d') ?? now()->format('Y-m-d');

        $mesFechado = MonthlyClosure::where('month', Carbon::parse($dataPagamento)->month)
            ->where('year', Carbon::parse($dataPagamento)->year)
            ->exists();

        if ($mesFechado) {
            Log::warning('FluxoCaixa: mês de pagamento já finalizado, entrada não criada', [
                'mensalidade_id' => $mensalidade->id,
                'data_pagamento' => $dataPagamento,
            ]);
            return;
        }

        $categoria = FinancialCategory::where('nome', 'Mensalidades')->first();

        Transaction::updateOrCreate(
            [
                'source_type' => 'mensalidade',
                'source_id' => $mensalidade->id,
            ],
            [
                'description' => $this->descricaoMensalidade($mensalidade),
                'amount' => (float) $mensalidade->valor,
                'type' => 'entrada',
                'category_name' => $categoria?->nome ?? 'Mensalidades',
                'date' => $dataPagamento,
            ]
        );
    }

    private function descricaoMensalidade(Mensalidade $mensalidade): string
    {
        return sprintf(
            'Mensalidade - %s - %s',
            $mensalidade->aluno?->nome ?? '—',
            $mensalidade->mes_referencia,
        );
    }

    public function formaPagamentoParaAuditoria(?string $forma): ?string
    {
        return match ($forma) {
            'pix' => 'bank_transfer',
            'debito' => 'debit',
            'credito' => 'credit',
            default => null,
        };
    }
}
