import api from "@/lib/api";
import type { Mensalidade, OrigemPagamento } from "@/lib/mock-data";

export interface AssociadoMensalidade {
  id: string;
  aluno_id: string;
  mes_referencia: string;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: string;
  forma_pagamento: string | null;
  origem: OrigemPagamento | null;
  aluno_nome: string | null;
  created_at: string;
}

export interface AssociadoMensalidadesResponse {
  success: boolean;
  data: AssociadoMensalidade[];
}

function toCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function mapKeys<T>(obj: Record<string, unknown>, fn: (k: string) => string): T {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    result[fn(key)] = obj[key];
  }
  return result as T;
}

export function mensalidadeFromApi(raw: AssociadoMensalidade): Mensalidade {
  const mapped = mapKeys<Record<string, unknown>>(raw as unknown as Record<string, unknown>, toCamel);
  mapped.id = String(mapped.id);
  mapped.alunoId = String(mapped.alunoId);
  mapped.valor = Number(mapped.valor) || 0;
  return mapped as unknown as Mensalidade;
}

export async function fetchAssociadoMensalidades(): Promise<Mensalidade[]> {
  const token = localStorage.getItem("associado_token") || localStorage.getItem("edu_token");
  const email = localStorage.getItem("associado_email");
  const params = new URLSearchParams();
  if (token && token !== "undefined") params.set("token", token);
  if (email) params.set("email", email);
  const qs = params.toString();
  const { data } = await api.get<AssociadoMensalidadesResponse>(`/associado/mensalidades${qs ? `?${qs}` : ""}`);
  if (!data.success) return [];
  return data.data.map(mensalidadeFromApi);
}
