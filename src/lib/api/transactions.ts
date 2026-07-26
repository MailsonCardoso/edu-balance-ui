import api from "@/lib/api";

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: "entrada" | "saida";
  financial_category_id: number | null;
  category?: { id: number; nome: string; cor: string } | null;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionsResponse {
  previous_balance: number;
  transactions: Transaction[];
  is_closed: boolean;
  closing_balance: number | null;
}

export async function fetchTransactions(
  month: number,
  year: number,
): Promise<TransactionsResponse> {
  const { data } = await api.get("/transactions", { params: { month, year } });
  return data;
}

export async function createTransaction(
  t: Partial<Transaction>,
): Promise<Transaction> {
  const { data } = await api.post("/transactions", t);
  return data;
}

export async function deleteTransaction(id: number): Promise<void> {
  await api.delete(`/transactions/${id}`);
}

export async function closeMonth(
  month: number,
  year: number,
): Promise<{ message: string; closing_balance: number }> {
  const { data } = await api.post("/transactions/close-month", { month, year });
  return data;
}
