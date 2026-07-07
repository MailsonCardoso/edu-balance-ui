<?php

namespace App\Enums;

enum PagamentoOrigem: string
{
    case MercadoPago = 'mercadopago';
    case Caixa = 'caixa';
    case Admin = 'admin';
    case PixManual = 'pix_manual';
    case Dinheiro = 'dinheiro';
    case Transferencia = 'transferencia';
}
