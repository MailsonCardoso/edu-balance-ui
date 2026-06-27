import api from "@/lib/api";
import type { Expense } from "@/lib/financeiro-types";

export async function fetchExpenses(params?: Record<string, string>): Promise<Expense[]> {
  const { data } = await api.get("/expenses", { params });
  return data;
}

export async function fetchExpense(id: string): Promise<Expense> {
  const { data } = await api.get(`/expenses/${id}`);
  return data;
}

export async function createExpense(expense: Partial<Expense>): Promise<Expense> {
  const { data } = await api.post("/expenses", expense);
  return data;
}

export async function updateExpense(id: string, expense: Partial<Expense>): Promise<Expense> {
  const { data } = await api.put(`/expenses/${id}`, expense);
  return data;
}

export async function deleteExpense(id: string): Promise<void> {
  await api.delete(`/expenses/${id}`);
}

export async function pagarExpense(id: string, dataPg: { data_pagamento: string; forma_pagamento?: string }): Promise<Expense> {
  const { data } = await api.put(`/expenses/${id}/pagar`, dataPg);
  return data;
}

export async function estornarExpense(id: string): Promise<Expense> {
  const { data } = await api.put(`/expenses/${id}/estornar`);
  return data;
}
