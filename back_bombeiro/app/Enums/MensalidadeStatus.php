<?php

namespace App\Enums;

enum MensalidadeStatus: string
{
    case Pendente = 'pendente';
    case Pago = 'pago';
    case Atrasado = 'atrasado';
}
