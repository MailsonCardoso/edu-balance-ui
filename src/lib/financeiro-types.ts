export type Role = "admin" | "financeiro" | "secretaria" | "direcao";

export interface UserFinanceiro {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Revenue {
  id: string;
  data: string;
  financial_category_id: string;
  descricao: string;
  valor: number;
  forma_pagamento: string | null;
  cost_center_id: string | null;
  comprovante: string | null;
  observacoes: string | null;
  origem: string;
  mensalidade_id: string | null;
  status: "recebido" | "pendente" | "cancelado";
  data_recebimento: string | null;
  user_id: string | null;
  category?: FinancialCategory | null;
  cost_center?: CostCenter | null;
  user?: { id: string; name: string } | null;
  created_at?: string;
  updated_at?: string;
}

export interface Expense {
  id: string;
  data: string;
  financial_category_id: string;
  descricao: string;
  fornecedor: string | null;
  valor: number;
  forma_pagamento: string | null;
  data_vencimento: string | null;
  data_pagamento: string | null;
  status: "pendente" | "pago" | "atrasado" | "cancelado";
  cost_center_id: string | null;
  comprovante: string | null;
  observacoes: string | null;
  user_id: string | null;
  category?: FinancialCategory | null;
  cost_center?: CostCenter | null;
  user?: { id: string; name: string } | null;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialCategory {
  id: string;
  nome: string;
  tipo: "receita" | "despesa";
  cor: string | null;
  icone: string | null;
  ativo: boolean;
}

export interface CostCenter {
  id: string;
  nome: string;
  codigo: string;
  descricao: string | null;
  ativo: boolean;
}

export interface DashboardData {
  saldo_atual: number;
  entradas_mes: number;
  saidas_mes: number;
  saldo_mes: number;
  receita_prevista: number;
  receita_recebida: number;
  mensalidades_aberto: number;
  mensalidades_vencidas: number;
  contas_pagar: number;
  contas_vencidas: number;
  contas_pagas: number;
  total_alunos_ativos: number;
  receita_media_aluno: number;
  perc_inadimplencia: number;
  receitas_por_categoria: { nome: string; valor: number; cor: string }[];
  despesas_por_categoria: { nome: string; valor: number; cor: string }[];
  receitas_mensais: { mes: string; receita: number }[];
  despesas_mensais: { mes: string; despesa: number }[];
  evolucao_saldo: { mes: string; saldo: number }[];
  entradas_x_saidas: { mes: string; entradas: number; saidas: number }[];
  comparativo_mensal: {
    mes_atual: string;
    mes_anterior: string;
    entradas_atual: number;
    entradas_anterior: number;
    saidas_atual: number;
    saidas_anterior: number;
  };
}

export const RECEITA_CATEGORIAS_SUGESTAO = [
  "Matrículas", "Mensalidades", "Venda de Uniformes", "Venda de Apostilas",
  "Eventos", "Convênios", "Patrocínios", "Doações", "Cursos", "Serviços", "Outros",
];

export const DESPESA_CATEGORIAS_SUGESTAO = [
  "Salários", "Pró-labore", "Água", "Energia", "Internet", "Telefone",
  "Aluguel", "Material Escolar", "Material de Escritório", "Material de Limpeza",
  "Alimentação", "Combustível", "Manutenção", "Marketing", "Impostos",
  "Taxas Bancárias", "Equipamentos", "Outros",
];

export const FORMA_PAGAMENTO_OPCOES = [
  { value: "pix", label: "Pix" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "debito", label: "Débito" },
  { value: "credito", label: "Crédito" },
  { value: "boleto", label: "Boleto" },
  { value: "transferencia", label: "Transferência" },
];

export const STATUS_DESPESA = [
  { value: "pendente", label: "Pendente" },
  { value: "pago", label: "Pago" },
  { value: "atrasado", label: "Atrasado" },
  { value: "cancelado", label: "Cancelado" },
];

export const STATUS_RECEITA = [
  { value: "recebido", label: "Recebido" },
  { value: "pendente", label: "Pendente" },
  { value: "cancelado", label: "Cancelado" },
];
