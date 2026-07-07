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
  const { data } = await api.get<AssociadoMensalidadesResponse>("/associado/mensalidades");
  if (!data.success) return [];
  return data.data.map(mensalidadeFromApi);
}

export interface GerarCobrancaResponse {
  success: boolean;
  data?: {
    id: string;
    payment_url: string;
    external_reference: string;
    preference_id: string;
    status: string;
  };
  message?: string;
}

export async function gerarCobrancaMensalidade(mensalidadeId: string): Promise<GerarCobrancaResponse> {
  const { data } = await api.post<GerarCobrancaResponse>(
    `/mensalidades/${mensalidadeId}/gerar-cobranca`
  );
  return data;
}

export async function consultarStatusPagamento(mensalidadeId: string) {
  const { data } = await api.get(`/mensalidades/${mensalidadeId}/status-pagamento`);
  return data;
}
