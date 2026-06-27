import api from "@/lib/api";
import type { FinancialCategory } from "@/lib/financeiro-types";

export async function fetchFinancialCategories(tipo?: string): Promise<FinancialCategory[]> {
  const { data } = await api.get("/financial-categories", { params: tipo ? { tipo } : {} });
  return data;
}

export async function createFinancialCategory(cat: Partial<FinancialCategory>): Promise<FinancialCategory> {
  const { data } = await api.post("/financial-categories", cat);
  return data;
}

export async function updateFinancialCategory(id: string, cat: Partial<FinancialCategory>): Promise<FinancialCategory> {
  const { data } = await api.put(`/financial-categories/${id}`, cat);
  return data;
}

export async function deleteFinancialCategory(id: string): Promise<void> {
  await api.delete(`/financial-categories/${id}`);
}
