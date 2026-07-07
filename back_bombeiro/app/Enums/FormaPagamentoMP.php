<?php

namespace App\Enums;

enum FormaPagamentoMP: string
{
    case Pix = 'pix';
    case Boleto = 'boleto';

    public function label(): string
    {
        return match ($this) {
            self::Pix => 'PIX',
            self::Boleto => 'Boleto Bancário',
        };
    }
}
