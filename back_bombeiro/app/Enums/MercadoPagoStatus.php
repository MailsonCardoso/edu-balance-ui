<?php

namespace App\Enums;

enum MercadoPagoStatus: string
{
    case Approved = 'approved';
    case Pending = 'pending';
    case InProcess = 'in_process';
    case Authorized = 'authorized';
    case Rejected = 'rejected';
    case Cancelled = 'cancelled';
    case Refunded = 'refunded';
    case ChargedBack = 'charged_back';
    case Expired = 'expired';

    public function mensalidadeStatus(): ?MensalidadeStatus
    {
        return match ($this) {
            self::Approved => MensalidadeStatus::Pago,
            self::Pending, self::InProcess, self::Authorized => MensalidadeStatus::Pendente,
            self::Rejected, self::Cancelled, self::Expired => MensalidadeStatus::Atrasado,
            self::Refunded, self::ChargedBack => MensalidadeStatus::Atrasado,
        };
    }

    public function isFinal(): bool
    {
        return in_array($this, [
            self::Approved,
            self::Rejected,
            self::Cancelled,
            self::Refunded,
            self::ChargedBack,
            self::Expired,
        ]);
    }
}
