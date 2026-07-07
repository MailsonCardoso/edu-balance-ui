<?php

namespace App\DTOs;

final readonly class WebhookNotificationDTO
{
    public function __construct(
        public string $id,
        public string $topic,
        public ?string $resource,
        public ?string $action,
        public ?string $dataId,
        public ?string $type,
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            id: $data['id'] ?? '',
            topic: $data['topic'] ?? $data['type'] ?? '',
            resource: $data['resource'] ?? null,
            action: $data['action'] ?? null,
            dataId: $data['data']['id'] ?? null,
            type: $data['type'] ?? null,
        );
    }

    public function isPaymentNotification(): bool
    {
        return $this->topic === 'payment'
            || $this->topic === 'mercadopago_payment'
            || $this->dataId !== null;
    }

    public function getPaymentId(): ?string
    {
        return $this->dataId ?? $this->id;
    }
}
