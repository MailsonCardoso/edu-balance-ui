import api from "@/lib/api";
import type { Revenue } from "@/lib/financeiro-types";

export async function fetchRevenues(params?: Record<string, string>): Promise<Revenue[]> {
  const { data } = await api.get("/revenues", { params });
  return data;
}

export async function fetchRevenue(id: string): Promise<Revenue> {
  const { data } = await api.get(`/revenues/${id}`);
  return data;
}

export async function createRevenue(revenue: Partial<Revenue>): Promise<Revenue> {
  const { data } = await api.post("/revenues", revenue);
  return data;
}

export async function updateRevenue(id: string, revenue: Partial<Revenue>): Promise<Revenue> {
  const { data } = await api.put(`/revenues/${id}`, revenue);
  return data;
}

export async function deleteRevenue(id: string): Promise<void> {
  await api.delete(`/revenues/${id}`);
}
