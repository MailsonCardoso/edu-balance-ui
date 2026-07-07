<?php

namespace App\DTOs;

final readonly class AtualizarStatusDTO
{
    public function __construct(
        public string $paymentId,
        public string $status,
        public ?string $paymentMethod,
        public ?string $payerEmail,
        public ?\DateTimeInterface $aprovadoEm,
        public mixed $respostaApi,
    ) {}

    public static function fromMercadoPagoResponse(array $response): self
    {
        $status = $response['status'] ?? 'pending';
        $aprovadoEm = null;

        if ($status === 'approved' && isset($response['date_approved'])) {
            $aprovadoEm = new \DateTimeImmutable($response['date_approved']);
        }

        return new self(
            paymentId: (string) ($response['id'] ?? ''),
            status: $status,
            paymentMethod: $response['payment_method']['type'] ?? $response['payment_type_id'] ?? null,
            payerEmail: $response['payer']['email'] ?? null,
            aprovadoEm: $aprovadoEm,
            respostaApi: $response,
        );
    }
}
