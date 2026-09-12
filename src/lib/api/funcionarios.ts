import api from "@/lib/api";

export type FuncionarioRole = "admin" | "secretaria";

export interface Funcionario {
  id: number;
  name: string;
  email: string;
  cpf: string | null;
  telefone: string | null;
  role: FuncionarioRole;
  must_change_password?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FuncionarioPayload {
  name: string;
  email: string;
  cpf: string;
  telefone?: string;
  role: FuncionarioRole;
  password?: string;
}

export async function fetchFuncionarios(): Promise<Funcionario[]> {
  const { data } = await api.get<Funcionario[]>("/funcionarios");
  return data;
}

export async function createFuncionario(payload: FuncionarioPayload): Promise<Funcionario> {
  const { data } = await api.post<Funcionario>("/funcionarios", payload);
  return data;
}

export async function updateFuncionario(
  id: number,
  payload: Partial<FuncionarioPayload>,
): Promise<Funcionario> {
  const { data } = await api.put<Funcionario>(`/funcionarios/${id}`, payload);
  return data;
}

export async function deleteFuncionario(id: number): Promise<void> {
  await api.delete(`/funcionarios/${id}`);
}

export function senhaInicialDoCpf(cpf: string): string {
  return cpf.replace(/\D/g, "").slice(0, 6) || "123456";
}

export function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}
