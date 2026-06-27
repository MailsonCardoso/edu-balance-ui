import api from "@/lib/api";
import type { DashboardData } from "@/lib/financeiro-types";

export async function fetchDashboardFinanceiro(): Promise<DashboardData> {
  const { data } = await api.get("/dashboard/financeiro");
  return data;
}
