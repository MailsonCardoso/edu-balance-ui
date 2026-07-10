<?php

namespace App\Http\Controllers;

use App\Models\Ouvidoria;
use App\Models\PagamentoTransacao;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(): JsonResponse
    {
        $user = Auth::user();
        $since = $user->notifications_read_at ?? now()->subDay();

        $ouvidorias = Ouvidoria::where('status', 'pendente')
            ->where('created_at', '>', $since)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($o) => [
                'id' => 'ouvidoria_' . $o->id,
                'type' => 'ouvidoria',
                'message' => "Nova manifestação: {$o->tipo}",
                'protocolo' => $o->protocolo,
                'link' => '/gestao-ouvidoria',
                'created_at' => $o->created_at,
            ]);

        $pagamentos = PagamentoTransacao::where('status', 'pending')
            ->where('created_at', '>', $since)
            ->with('mensalidade.aluno:id,nome')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($p) => [
                'id' => 'pagamento_' . $p->id,
                'type' => 'pagamento',
                'message' => "Novo pagamento de {$p->mensalidade?->aluno?->nome}",
                'link' => '/gestao-auditoria',
                'created_at' => $p->created_at,
            ]);

        $notifications = $ouvidorias
            ->concat($pagamentos)
            ->sortByDesc('created_at')
            ->values()
            ->take(10);

        return response()->json([
            'total' => $notifications->count(),
            'data' => $notifications,
        ]);
    }

    public function markAsRead(): JsonResponse
    {
        $user = Auth::user();
        $user->notifications_read_at = now();
        $user->save();

        return response()->json(['success' => true]);
    }
}
