export type AlunoStatus = "ativo" | "inativo";
export type SituacaoFinanceira = "em_dia" | "pendente" | "inadimplente";
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

export const turmas = ["1º Ano A", "1º Ano B", "2º Ano A", "3º Ano A", "5º Ano B", "6º Ano A", "9º Ano A"];

export const alunos: Aluno[] = [
  { id: "1", nome: "Ana Beatriz Souza", cpf: "111.222.333-44", dataNascimento: "2015-03-12", telefone: "(11) 98888-1111", email: "ana@email.com", endereco: "Rua A, 100", responsavel: "Carlos Souza", cpfResponsavel: "999.888.777-66", telefoneResponsavel: "(11) 99999-1111", turma: "3º Ano A", status: "ativo", situacao: "em_dia" },
  { id: "2", nome: "Bruno Henrique Lima", cpf: "222.333.444-55", dataNascimento: "2013-07-22", telefone: "(11) 98888-2222", email: "bruno@email.com", endereco: "Rua B, 200", responsavel: "Patrícia Lima", cpfResponsavel: "888.777.666-55", telefoneResponsavel: "(11) 99999-2222", turma: "5º Ano B", status: "ativo", situacao: "inadimplente" },
  { id: "3", nome: "Camila Rodrigues", cpf: "333.444.555-66", dataNascimento: "2010-11-05", telefone: "(11) 98888-3333", email: "camila@email.com", endereco: "Rua C, 300", responsavel: "Roberto Rodrigues", cpfResponsavel: "777.666.555-44", telefoneResponsavel: "(11) 99999-3333", turma: "9º Ano A", status: "ativo", situacao: "pendente" },
  { id: "4", nome: "Diego Almeida", cpf: "444.555.666-77", dataNascimento: "2016-01-18", telefone: "(11) 98888-4444", email: "diego@email.com", endereco: "Rua D, 400", responsavel: "Marcela Almeida", cpfResponsavel: "666.555.444-33", telefoneResponsavel: "(11) 99999-4444", turma: "2º Ano A", status: "ativo", situacao: "em_dia" },
  { id: "5", nome: "Eduarda Castro", cpf: "555.666.777-88", dataNascimento: "2014-05-30", telefone: "(11) 98888-5555", email: "eduarda@email.com", endereco: "Rua E, 500", responsavel: "Felipe Castro", cpfResponsavel: "555.444.333-22", telefoneResponsavel: "(11) 99999-5555", turma: "5º Ano B", status: "ativo", situacao: "inadimplente" },
  { id: "6", nome: "Fernando Oliveira", cpf: "666.777.888-99", dataNascimento: "2012-09-14", telefone: "(11) 98888-6666", email: "fernando@email.com", endereco: "Rua F, 600", responsavel: "Tatiana Oliveira", cpfResponsavel: "444.333.222-11", telefoneResponsavel: "(11) 99999-6666", turma: "6º Ano A", status: "ativo", situacao: "em_dia" },
  { id: "7", nome: "Giovanna Pereira", cpf: "777.888.999-00", dataNascimento: "2017-02-25", telefone: "(11) 98888-7777", email: "gio@email.com", endereco: "Rua G, 700", responsavel: "Lucas Pereira", cpfResponsavel: "333.222.111-00", telefoneResponsavel: "(11) 99999-7777", turma: "1º Ano A", status: "ativo", situacao: "pendente" },
  { id: "8", nome: "Henrique Martins", cpf: "888.999.000-11", dataNascimento: "2011-12-08", telefone: "(11) 98888-8888", email: "henrique@email.com", endereco: "Rua H, 800", responsavel: "Vanessa Martins", cpfResponsavel: "222.111.000-99", telefoneResponsavel: "(11) 99999-8888", turma: "6º Ano A", status: "inativo", situacao: "em_dia" },
];

const today = new Date();
function dateOffset(months: number, day: number) {
  const d = new Date(today.getFullYear(), today.getMonth() + months, day);
  return d.toISOString().slice(0, 10);
}

export const mensalidades: Mensalidade[] = [
  { id: "m1", alunoId: "1", alunoNome: "Ana Beatriz Souza", competencia: "11/2025", vencimento: dateOffset(-1, 10), valor: 850, valorPago: 850, status: "pago" },
  { id: "m2", alunoId: "1", alunoNome: "Ana Beatriz Souza", competencia: "12/2025", vencimento: dateOffset(0, 10), valor: 850, status: "pendente" },
  { id: "m3", alunoId: "2", alunoNome: "Bruno Henrique Lima", competencia: "10/2025", vencimento: dateOffset(-2, 10), valor: 950, status: "vencido" },
  { id: "m4", alunoId: "2", alunoNome: "Bruno Henrique Lima", competencia: "11/2025", vencimento: dateOffset(-1, 10), valor: 950, status: "vencido" },
  { id: "m5", alunoId: "3", alunoNome: "Camila Rodrigues", competencia: "12/2025", vencimento: dateOffset(0, 5), valor: 1100, valorPago: 500, status: "parcial" },
  { id: "m6", alunoId: "4", alunoNome: "Diego Almeida", competencia: "11/2025", vencimento: dateOffset(-1, 10), valor: 780, valorPago: 780, status: "pago" },
  { id: "m7", alunoId: "5", alunoNome: "Eduarda Castro", competencia: "09/2025", vencimento: dateOffset(-3, 10), valor: 950, status: "vencido" },
  { id: "m8", alunoId: "5", alunoNome: "Eduarda Castro", competencia: "10/2025", vencimento: dateOffset(-2, 10), valor: 950, status: "vencido" },
  { id: "m9", alunoId: "5", alunoNome: "Eduarda Castro", competencia: "11/2025", vencimento: dateOffset(-1, 10), valor: 950, status: "vencido" },
  { id: "m10", alunoId: "6", alunoNome: "Fernando Oliveira", competencia: "12/2025", vencimento: dateOffset(0, 15), valor: 1050, valorPago: 1050, status: "pago" },
  { id: "m11", alunoId: "7", alunoNome: "Giovanna Pereira", competencia: "12/2025", vencimento: dateOffset(0, 10), valor: 720, status: "pendente" },
];

export const receitaMensal = [
  { mes: "Jun", receita: 42000, meta: 48000 },
  { mes: "Jul", receita: 45000, meta: 48000 },
  { mes: "Ago", receita: 47500, meta: 48000 },
  { mes: "Set", receita: 49200, meta: 50000 },
  { mes: "Out", receita: 51000, meta: 50000 },
  { mes: "Nov", receita: 53400, meta: 52000 },
  { mes: "Dez", receita: 38900, meta: 52000 },
];

export const receitaAnual = [
  { ano: "2021", receita: 410000 },
  { ano: "2022", receita: 478000 },
  { ano: "2023", receita: 532000 },
  { ano: "2024", receita: 589000 },
  { ano: "2025", receita: 612000 },
];

export const inadimplenciaPeriodo = [
  { mes: "Jun", percentual: 8.2 },
  { mes: "Jul", percentual: 7.5 },
  { mes: "Ago", percentual: 9.1 },
  { mes: "Set", percentual: 10.4 },
  { mes: "Out", percentual: 11.2 },
  { mes: "Nov", percentual: 9.8 },
  { mes: "Dez", percentual: 12.3 },
];

export const evolucaoPagamentos = [
  { dia: "01", pagos: 12, pendentes: 4 },
  { dia: "05", pagos: 28, pendentes: 9 },
  { dia: "10", pagos: 65, pendentes: 18 },
  { dia: "15", pagos: 82, pendentes: 12 },
  { dia: "20", pagos: 94, pendentes: 8 },
  { dia: "25", pagos: 108, pendentes: 6 },
  { dia: "30", pagos: 122, pendentes: 3 },
];

export const dashboardStats = {
  totalRecebido: 53400,
  totalAberto: 18750,
  totalVencido: 12480,
  alunosAtivos: 187,
  alunosInadimplentes: 23,
};
