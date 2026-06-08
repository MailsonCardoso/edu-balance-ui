export type AlunoStatus = "ativo" | "inativo";
export type SituacaoFinanceira = "em_dia" | "em_atraso" | "inadimplente";
export type MensalidadeStatus = "pago" | "pendente" | "vencido" | "parcial";

export interface Aluno {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  email: string;
  endereco: string;
  responsavel: string;
  cpfResponsavel: string;
  telefoneResponsavel: string;
  turma: string;
  status: AlunoStatus;
  situacao: SituacaoFinanceira;
}

export interface Mensalidade {
  id: string;
  alunoId: string;
  alunoNome: string;
  competencia: string;
  vencimento: string;
  valor: number;
  valorPago?: number;
  status: MensalidadeStatus;
}

export const turmas = [
  "1º Ano A",
  "1º Ano B",
  "2º Ano A",
  "3º Ano A",
  "5º Ano B",
  "6º Ano A",
  "9º Ano A",
];
