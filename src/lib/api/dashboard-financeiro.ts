import api from "@/lib/api";

export interface DashboardFinanceiro {
  total_pago: number;
  total_pendente: number;
  total_vencido: number;
  qtd_pagas: number;
  qtd_pendentes: number;
  qtd_vencidas: number;
  receita_mes: number;
  despesa_mes: number;
  saldo_mes: number;
  receita_prevista: number;
  despesa_pendente: number;
  alunos_ativos: number;
  alunos_inadimplentes: number;
  perc_inadimplencia: number;
  receitas_mensais: { mes: string; receita: number; despesa: number }[];
}

export async function fetchDashboardFinanceiro(): Promise<DashboardFinanceiro> {
  const { data } = await api.get("/dashboard/financeiro");
  return data;
}
