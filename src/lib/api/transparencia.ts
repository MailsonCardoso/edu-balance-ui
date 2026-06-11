import api from "@/lib/api";

export interface TransparenciaData {
  alunos: {
    total: number;
    ativos: number;
    em_dia: number;
    em_atraso: number;
    inadimplentes: number;
  };
  financeiro: {
    receitas_mes: number;
    receitas_ano: number;
    a_receber: number;
    total_pago: number;
    total_mensalidades_previstas: number;
  };
  mensalidades: {
    total: number;
    pagas: number;
    pendentes: number;
    atrasadas: number;
  };
}

export async function getTransparencia(): Promise<TransparenciaData> {
  const { data } = await api.get<{ data: TransparenciaData }>("/transparencia");
  return data.data;
}
