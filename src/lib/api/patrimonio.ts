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

const mock: Patrimonio[] = [
  { id: "1", tag: "PAT-0001", nome: "Notebook Dell Latitude 3540", numeroSerie: "SN-DELL-001", categoria: "TI", localizacao: "Sede", responsavel: "Maria Silva", setor: "Secretaria", valorCompra: 5200, valorDepreciado: 3640, dataCompra: "2023-03-15", dataUltimaAuditoria: "2024-06-10", status: "ativo" },
  { id: "2", tag: "PAT-0002", nome: "Mesa Executiva 160cm", numeroSerie: "SN-MOB-022", categoria: "Mobiliário", localizacao: "Sede", responsavel: "João Santos", setor: "Diretoria", valorCompra: 2800, valorDepreciado: 1960, dataCompra: "2022-11-01", dataUltimaAuditoria: "2024-01-15", status: "ativo" },
  { id: "3", tag: "PAT-0003", nome: "Furgão Fiat Fiorino 2022", numeroSerie: "SN-VEI-001", categoria: "Veículos", localizacao: "Sede", responsavel: "Carlos Oliveira", setor: "Logística", valorCompra: 85000, valorDepreciado: 59500, dataCompra: "2022-05-20", dataUltimaAuditoria: "2024-03-01", status: "ativo" },
  { id: "4", tag: "PAT-0004", nome: "Projetor Epson EB-U50", numeroSerie: "SN-TI-034", categoria: "TI", localizacao: "Filial", responsavel: "Ana Costa", setor: "Pedagógico", valorCompra: 3800, valorDepreciado: 2280, dataCompra: "2023-07-10", dataUltimaAuditoria: null, status: "ativo" },
  { id: "5", tag: "PAT-0005", nome: "Cadeira Ergonômica Cavaletti", numeroSerie: "SN-MOB-045", categoria: "Mobiliário", localizacao: "Sede", responsavel: "Maria Silva", setor: "Secretaria", valorCompra: 1800, valorDepreciado: 1260, dataCompra: "2023-01-20", dataUltimaAuditoria: "2024-06-10", status: "em_manutencao" },
  { id: "6", tag: "PAT-0006", nome: "Ar Condicionado Split 12000BTU", numeroSerie: "SN-EL-007", categoria: "Eletrodoméstico", localizacao: "Filial", responsavel: "Paulo Lima", setor: "Manutenção", valorCompra: 2400, valorDepreciado: 1440, dataCompra: "2021-09-05", dataUltimaAuditoria: "2023-09-05", status: "em_manutencao" },
  { id: "7", tag: "PAT-0007", nome: "Monitor LG 27\" 4K", numeroSerie: "SN-TI-056", categoria: "TI", localizacao: "Home Office", responsavel: "Ricardo Almeida", setor: "TI", valorCompra: 2100, valorDepreciado: 1470, dataCompra: "2023-06-01", dataUltimaAuditoria: null, status: "ativo" },
  { id: "8", tag: "PAT-0008", nome: "Impressora Multifuncional Brother", numeroSerie: "SN-TI-078", categoria: "TI", localizacao: "Sede", responsavel: "Setor Administrativo", setor: "Administrativo", valorCompra: 1600, valorDepreciado: 800, dataCompra: "2020-02-15", dataUltimaAuditoria: "2024-01-20", status: "baixado" },
  { id: "9", tag: "PAT-0009", nome: "Veículo VW Kombi 2010", numeroSerie: "SN-VEI-002", categoria: "Veículos", localizacao: "Filial", responsavel: "Logística", setor: "Logística", valorCompra: 32000, valorDepreciado: 6400, dataCompra: "2010-08-20", dataUltimaAuditoria: "2023-08-20", status: "ativo" },
  { id: "10", tag: "PAT-0010", nome: "Notebook Lenovo ThinkPad X1", numeroSerie: "SN-DELL-002", categoria: "TI", localizacao: "Sede", responsavel: "Diretoria", setor: "Diretoria", valorCompra: 8900, valorDepreciado: 6230, dataCompra: "2024-01-10", dataUltimaAuditoria: "2025-01-10", status: "emprestado" },
  { id: "11", tag: "PAT-0011", nome: "Aparelho de Som Microsystem", numeroSerie: "SN-EL-012", categoria: "Eletrodoméstico", localizacao: "Sede", responsavel: "Eventos", setor: "Eventos", valorCompra: 950, valorDepreciado: 475, dataCompra: "2022-03-10", dataUltimaAuditoria: null, status: "ativo" },
  { id: "12", tag: "PAT-0012", nome: "Bebedouro Industrial", numeroSerie: "SN-EL-015", categoria: "Eletrodoméstico", localizacao: "Sede", responsavel: "Manutenção", setor: "Manutenção", valorCompra: 1200, valorDepreciado: 600, dataCompra: "2021-02-01", dataUltimaAuditoria: "2024-02-01", status: "em_manutencao" },
  { id: "13", tag: "PAT-0013", nome: "Mesa Redonda 8 Lugares", numeroSerie: "SN-MOB-078", categoria: "Mobiliário", localizacao: "Filial", responsavel: "Coordenação", setor: "Coordenação", valorCompra: 2200, valorDepreciado: 1540, dataCompra: "2023-05-15", dataUltimaAuditoria: "2024-11-20", status: "ativo" },
  { id: "14", tag: "PAT-0014", nome: "Câmera de Segurança IP", numeroSerie: "SN-TI-092", categoria: "TI", localizacao: "Sede", responsavel: "TI", setor: "TI", valorCompra: 450, valorDepreciado: 315, dataCompra: "2024-06-01", dataUltimaAuditoria: null, status: "ativo" },
  { id: "15", tag: "PAT-0015", nome: "Estabilizador de Tensão 2kVA", numeroSerie: "SN-TI-101", categoria: "TI", localizacao: "Sede", responsavel: "TI", setor: "TI", valorCompra: 680, valorDepreciado: 340, dataCompra: "2020-11-20", dataUltimaAuditoria: "2023-11-20", status: "baixado" },
  { id: "16", tag: "PAT-0016", nome: "Fogão Industrial 6 Bocas", numeroSerie: "SN-EL-021", categoria: "Eletrodoméstico", localizacao: "Filial", responsavel: "Cozinha", setor: "Cozinha", valorCompra: 3200, valorDepreciado: 2240, dataCompra: "2022-08-01", dataUltimaAuditoria: "2024-08-01", status: "ativo" },
  { id: "17", tag: "PAT-0017", nome: "Home Office Kit (Mesa + Cadeira)", numeroSerie: "SN-MOB-089", categoria: "Mobiliário", localizacao: "Home Office", responsavel: "Fernanda Rocha", setor: "Pedagógico", valorCompra: 1500, valorDepreciado: 1050, dataCompra: "2023-09-01", dataUltimaAuditoria: null, status: "emprestado" },
  { id: "18", tag: "PAT-0018", nome: "Televisor 55\" LED", numeroSerie: "SN-EL-025", categoria: "Eletrodoméstico", localizacao: "Sede", responsavel: "Eventos", setor: "Eventos", valorCompra: 2900, valorDepreciado: 2030, dataCompra: "2023-02-10", dataUltimaAuditoria: "2025-02-10", status: "ativo" },
  { id: "19", tag: "PAT-0019", nome: "Servidor Dell PowerEdge T140", numeroSerie: "SN-TI-110", categoria: "TI", localizacao: "Sede", responsavel: "TI", setor: "TI", valorCompra: 12500, valorDepreciado: 8750, dataCompra: "2023-12-01", dataUltimaAuditoria: "2025-03-15", status: "ativo" },
  { id: "20", tag: "PAT-0020", nome: "Veículo Toyota Hilux 2019", numeroSerie: "SN-VEI-003", categoria: "Veículos", localizacao: "Sede", responsavel: "Diretoria", setor: "Diretoria", valorCompra: 175000, valorDepreciado: 105000, dataCompra: "2019-07-15", dataUltimaAuditoria: "2024-07-15", status: "ativo" },
  { id: "21", tag: "PAT-0021", nome: "Projetor Multimídia BenQ", numeroSerie: "SN-TI-120", categoria: "TI", localizacao: "Depósito", responsavel: "TI", setor: "TI", valorCompra: 3100, valorDepreciado: 1085, dataCompra: "2020-01-10", dataUltimaAuditoria: null, status: "baixado" },
  { id: "22", tag: "PAT-0022", nome: "Mesa de Reunião 12 Lugares", numeroSerie: "SN-MOB-102", categoria: "Mobiliário", localizacao: "Sede", responsavel: "Diretoria", setor: "Diretoria", valorCompra: 4500, valorDepreciado: 3150, dataCompra: "2022-06-01", dataUltimaAuditoria: "2025-01-10", status: "ativo" },
  { id: "23", tag: "PAT-0023", nome: "Notebook Samsung Galaxy Book", numeroSerie: "SN-DELL-003", categoria: "TI", localizacao: "Home Office", responsavel: "Juliana Torres", setor: "Financeiro", valorCompra: 4800, valorDepreciado: 3360, dataCompra: "2023-11-20", dataUltimaAuditoria: "2025-02-20", status: "emprestado" },
  { id: "24", tag: "PAT-0024", nome: "Geladeira Consul Frost Free", numeroSerie: "SN-EL-031", categoria: "Eletrodoméstico", localizacao: "Filial", responsavel: "Cozinha", setor: "Cozinha", valorCompra: 2800, valorDepreciado: 1960, dataCompra: "2022-10-01", dataUltimaAuditoria: "2024-10-01", status: "em_manutencao" },
  { id: "25", tag: "PAT-0025", nome: "Scanner de Mesa HP", numeroSerie: "SN-TI-134", categoria: "TI", localizacao: "Sede", responsavel: "Secretaria", setor: "Secretaria", valorCompra: 780, valorDepreciado: 546, dataCompra: "2023-04-05", dataUltimaAuditoria: null, status: "ativo" },
];

export const categoriasDisponiveis: PatrimonioCategoria[] = ["TI", "Mobiliário", "Veículos", "Eletrodoméstico", "Imóvel", "Outros"];

export const localizacoesDisponiveis: PatrimonioLocalizacao[] = ["Sede", "Filial", "Home Office", "Depósito"];

export async function fetchPatrimonios(): Promise<Patrimonio[]> {
  const { data } = await api.get<{ data: Patrimonio[] }>("/patrimonios");
  return data.data;
}

export async function createPatrimonio(item: Omit<Patrimonio, "id">): Promise<Patrimonio> {
  const { data } = await api.post<{ data: Patrimonio }>("/patrimonios", item);
  return data.data;
}

export async function updatePatrimonio(id: string, item: Partial<Patrimonio>): Promise<Patrimonio> {
  const { data } = await api.put<{ data: Patrimonio }>(`/patrimonios/${id}`, item);
  return data.data;
}

export async function deletePatrimonio(id: string): Promise<void> {
  await api.delete(`/patrimonios/${id}`);
}
