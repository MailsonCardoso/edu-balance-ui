import api from "@/lib/api";
import type { UserFinanceiro } from "@/lib/financeiro-types";

export async function loginAuth(email: string, password: string): Promise<{ token: string; user: UserFinanceiro }> {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function fetchMe(): Promise<{ user: UserFinanceiro }> {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function logoutAuth(): Promise<void> {
  await api.post("/auth/logout");
}
