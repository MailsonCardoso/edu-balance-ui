import api from "@/lib/api";

export interface Expense {
  id: number;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: "pendente" | "pago" | "atrasado";
  financial_category_id: number | null;
  observacao: string | null;
  category?: { id: number; nome: string; cor: string } | null;
  created_at: string;
  updated_at: string;
}

export async function fetchExpenses(): Promise<Expense[]> {
  try {
    const { data } = await api.get("/expenses");
    return data;
  } catch {
    return [];
  }
}

export async function createExpense(e: Partial<Expense>): Promise<Expense> {
  const { data } = await api.post("/expenses", e);
  return data;
}

export async function updateExpense(id: number, e: Partial<Expense>): Promise<Expense> {
  const { data } = await api.put(`/expenses/${id}`, e);
  return data;
}

export async function deleteExpense(id: number): Promise<void> {
  await api.delete(`/expenses/${id}`);
}
