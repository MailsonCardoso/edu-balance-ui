import api from "@/lib/api";

export interface AuditoriaItem {
  id: number;
  payment_id: string | null;
  external_reference: string | null;
  status: string;
  payment_method: string | null;
  payer_email: string | null;
  data_criacao: string;
  data_aprovacao: string | null;
  issuer_id: string | null;
  banco_nome: string | null;
  e2e_id: string | null;
  aluno_nome: string | null;
  aluno_cpf: string | null;
  responsavel: string | null;
  cpf_responsavel: string | null;
  mes_referencia: string | null;
  valor: number | null;
  mensalidade_status: string | null;
}

export interface AuditoriaFilters {
  data_inicio?: string;
  data_fim?: string;
  status?: string;
  payment_method?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface AuditoriaResponse {
  current_page: number;
  data: AuditoriaItem[];
  last_page: number;
  total: number;
  per_page: number;
}

export async function fetchAuditoria(filters: AuditoriaFilters): Promise<AuditoriaResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== "") params.set(k, String(v));
  });
  const { data } = await api.get(`/admin/auditoria/pagamentos?${params}`);
  return data;
}

export async function deleteAuditoria(id: number): Promise<void> {
  await api.post(`/admin/auditoria/pagamentos/${id}`, { _method: "DELETE" });
}
