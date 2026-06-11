import api from "@/lib/api";

export interface CadastroPayload {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  nome_aluno?: string;
  password: string;
}

export interface AssociadoData {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  nome_aluno: string | null;
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
  const { data } = await api.get<AssociadoResponse>("/associado");
  return data;
}

export async function updateAssociado(
  payload: Partial<CadastroPayload>
): Promise<AssociadoResponse> {
  const { data } = await api.put<AssociadoResponse>("/associado", payload);
  return data;
}
