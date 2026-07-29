<?php

namespace App\Http\Controllers;

use App\Models\MonthlyClosure;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2000|max:2100',
        ]);

        $month = (int) $validated['month'];
        $year = (int) $validated['year'];

        $startDate = Carbon::create($year, $month, 1)->startOfDay();
        $endDate = $startDate->copy()->endOfMonth();

        $previousBalance = $this->calculatePreviousBalance($month, $year, $startDate);

        $transactions = Transaction::whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->orderBy('date', 'asc')
            ->orderBy('created_at', 'asc')
            ->get();

        $isClosed = MonthlyClosure::where('month', $month)
            ->where('year', $year)
            ->exists();

        $closure = MonthlyClosure::where('month', $month)
            ->where('year', $year)
            ->first();

        return response()->json([
            'previous_balance' => (float) $previousBalance,
            'transactions' => $transactions,
            'is_closed' => $isClosed,
            'closing_balance' => $closure ? (float) $closure->closing_balance : null,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:entrada,saida',
            'category_name' => 'required|string|max:255',
            'date' => 'required|date',
            'source_type' => 'nullable|string|in:mensalidade,revenue,expense,manual',
            'source_id' => 'nullable|integer',
        ]);

        if (!empty($validated['source_type']) && !empty($validated['source_id'])) {
            $vinculoExiste = Transaction::where('source_type', $validated['source_type'])
                ->where('source_id', $validated['source_id'])
                ->exists();

            if ($vinculoExiste) {
                return response()->json(['message' => 'Transação já vinculada a esta origem.'], 409);
            }
        }

        $transactionDate = Carbon::parse($validated['date']);
        $isClosed = MonthlyClosure::where('month', $transactionDate->month)
            ->where('year', $transactionDate->year)
            ->exists();

        if ($isClosed) {
            return response()->json(['message' => 'Mês já finalizado. Não é possível adicionar transações.'], 422);
        }

        $transaction = Transaction::create($validated);

        return response()->json($transaction, 201);
    }

    public function destroy(Transaction $transaction): JsonResponse
    {
        $transactionDate = Carbon::parse($transaction->date);
        $isClosed = MonthlyClosure::where('month', $transactionDate->month)
            ->where('year', $transactionDate->year)
            ->exists();

        if ($isClosed) {
            return response()->json(['message' => 'Mês já finalizado. Não é possível excluir transações.'], 422);
        }

        $transaction->delete();
        return response()->json(['message' => 'Transação excluída']);
    }

    public function closeMonth(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2000|max:2100',
        ]);

        $month = (int) $validated['month'];
        $year = (int) $validated['year'];

        $alreadyClosed = MonthlyClosure::where('month', $month)
            ->where('year', $year)
            ->exists();

        if ($alreadyClosed) {
            return response()->json(['message' => 'Mês já finalizado anteriormente.'], 422);
        }

        $startDate = Carbon::create($year, $month, 1)->startOfDay();
        $endDate = $startDate->copy()->endOfMonth();

        $previousBalance = $this->calculatePreviousBalance($month, $year, $startDate);

        $monthBalance = Transaction::whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'entrada' THEN amount ELSE -amount END), 0) as balance")
            ->value('balance');

        $closingBalance = $previousBalance + (float) $monthBalance;

        MonthlyClosure::create([
            'month' => $month,
            'year' => $year,
            'closing_balance' => $closingBalance,
        ]);

        return response()->json([
            'message' => 'Mês finalizado com sucesso.',
            'closing_balance' => $closingBalance,
        ]);
    }

    private function calculatePreviousBalance(int $month, int $year, Carbon $startDate): float
    {
        $lastClosure = MonthlyClosure::where(function ($q) use ($month, $year) {
            $q->where('year', '<', $year)
                ->orWhere(function ($q) use ($month, $year) {
                    $q->where('year', $year)->where('month', '<', $month);
                });
        })->orderBy('year', 'desc')->orderBy('month', 'desc')->first();

        if ($lastClosure) {
            $closureEndDate = Carbon::create($lastClosure->year, $lastClosure->month, 1)->endOfMonth();

            $additional = Transaction::where('date', '>', $closureEndDate->toDateString())
                ->where('date', '<', $startDate->toDateString())
                ->selectRaw("COALESCE(SUM(CASE WHEN type = 'entrada' THEN amount ELSE -amount END), 0) as balance")
                ->value('balance');

            return (float) $lastClosure->closing_balance + (float) $additional;
        }

        return (float) Transaction::where('date', '<', $startDate->toDateString())
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'entrada' THEN amount ELSE -amount END), 0) as balance")
            ->value('balance');
    }
}
