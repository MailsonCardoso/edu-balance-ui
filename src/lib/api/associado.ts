import api from "@/lib/api";

export interface CadastroPayload {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  nome_aluno?: string;
  password: string;
}

export interface AssociadoAluno {
  id: number;
  nome: string;
}

export interface AssociadoData {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  nome_aluno: string | null;
  alunos: AssociadoAluno[];
  status: string;
  created_at: string;
}

export interface AssociadoResponse {
  success: boolean;
  message: string;
  associado?: AssociadoData;
  token?: string;
}

export async function cadastrarAssociado(
  payload: CadastroPayload
): Promise<AssociadoResponse> {
  const { data } = await api.post<AssociadoResponse>("/associado", payload);
  return data;
}

export async function loginAssociado(
  email: string,
  password: string
): Promise<AssociadoResponse> {
  const { data } = await api.post<AssociadoResponse>("/associado/login", {
    email,
    password,
  });
  return data;
}

export async function getAssociado(): Promise<AssociadoResponse> {
  const token = localStorage.getItem("associado_token") || localStorage.getItem("edu_token");
  const { data } = await api.get<AssociadoResponse>(`/associado?token=${token || ""}`);
  return data;
}

export async function updateAssociado(
  payload: Partial<CadastroPayload>
): Promise<AssociadoResponse> {
  const { data } = await api.put<AssociadoResponse>("/associado", payload);
  return data;
}

export interface AssociadoListItem {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  nome_aluno: string | null;
  aluno_nome: string | null;
  alunos: AssociadoAluno[];
  status: string;
  created_at: string;
}

export async function fetchAssociados(): Promise<AssociadoListItem[]> {
  const { data } = await api.get<{ data: AssociadoListItem[] }>("/associados");
  return data.data;
}

export async function deleteAssociado(
  id: number
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/associados/${id}`);
  return data;
}
