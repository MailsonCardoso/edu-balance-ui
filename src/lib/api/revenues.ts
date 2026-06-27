import api from "@/lib/api";

export interface Revenue {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  data_recebimento: string | null;
  status: "pendente" | "recebido";
  financial_category_id: number | null;
  observacao: string | null;
  category?: { id: number; nome: string; cor: string } | null;
  created_at: string;
  updated_at: string;
}

export async function fetchRevenues(): Promise<Revenue[]> {
  const { data } = await api.get("/revenues");
  return data;
}

export async function createRevenue(r: Partial<Revenue>): Promise<Revenue> {
  const { data } = await api.post("/revenues", r);
  return data;
}

export async function updateRevenue(id: number, r: Partial<Revenue>): Promise<Revenue> {
  const { data } = await api.put(`/revenues/${id}`, r);
  return data;
}

export async function deleteRevenue(id: number): Promise<void> {
  await api.delete(`/revenues/${id}`);
}
