import api from "@/lib/api";

export type PatrimonioStatus = "ativo" | "em_manutencao" | "baixado" | "emprestado";

export type PatrimonioCategoria = "TI" | "Mobiliário" | "Veículos" | "Eletrodoméstico" | "Imóvel" | "Outros";

export type PatrimonioLocalizacao = "Sede" | "Filial" | "Home Office" | "Depósito";

export interface Patrimonio {
  id: string;
  tag: string;
  nome: string;
  numeroSerie: string;
  categoria: PatrimonioCategoria;
  localizacao: PatrimonioLocalizacao;
  responsavel: string;
  setor: string;
  valorCompra: number;
  valorDepreciado: number;
  dataCompra: string;
  dataUltimaAuditoria: string | null;
  status: PatrimonioStatus;
  observacao?: string;
}


export const categoriasDisponiveis: PatrimonioCategoria[] = ["TI", "Mobiliário", "Veículos", "Eletrodoméstico", "Imóvel", "Outros"];

export const localizacoesDisponiveis: PatrimonioLocalizacao[] = ["Sede", "Filial", "Home Office", "Depósito"];

export async function fetchPatrimonios(): Promise<Patrimonio[]> {
  const { data } = await api.get<Patrimonio[]>("/patrimonios");
  return data;
}

export async function createPatrimonio(item: Omit<Patrimonio, "id">): Promise<Patrimonio> {
  const { data } = await api.post<Patrimonio>("/patrimonios", item);
  return data;
}

export async function updatePatrimonio(id: string, item: Partial<Patrimonio>): Promise<Patrimonio> {
  const { data } = await api.put<Patrimonio>(`/patrimonios/${id}`, item);
  return data;
}

export async function deletePatrimonio(id: string): Promise<void> {
  await api.delete(`/patrimonios/${id}`);
}
