import api from "@/lib/api";

export interface FinancialCategory {
  id: number;
  nome: string;
  tipo: "receita" | "despesa";
  cor: string | null;
}

export async function fetchCategories(): Promise<FinancialCategory[]> {
  try {
    const { data } = await api.get("/financial-categories");
    return data;
  } catch {
    return [];
  }
}

export async function createCategory(c: Partial<FinancialCategory>): Promise<FinancialCategory> {
  const { data } = await api.post("/financial-categories", c);
  return data;
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/financial-categories/${id}`);
}
