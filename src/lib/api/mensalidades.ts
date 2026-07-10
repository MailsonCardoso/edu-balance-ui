import api from "@/lib/api";
import type { Mensalidade } from "@/lib/mock-data";
import { fetchAlunos } from "@/lib/api/alunos";

function toCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function toSnake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function mapKeys<T>(obj: Record<string, unknown>, fn: (k: string) => string): T {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    result[fn(key)] = obj[key];
  }
  return result as T;
}

function toDDMMYYYY(dateStr: string): string {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("pt-BR");
}

function mensalidadeFromApi(raw: Record<string, unknown>): Mensalidade {
  const mapped = mapKeys<Record<string, unknown>>(raw, toCamel);
  mapped.id = String(mapped.id);
  mapped.alunoId = String(mapped.alunoId);
  mapped.valor = Number(mapped.valor) || 0;
  if (mapped.dataVencimento && typeof mapped.dataVencimento === "string") {
    mapped.dataVencimento = toDDMMYYYY(mapped.dataVencimento);
  }
  if (mapped.dataPagamento && typeof mapped.dataPagamento === "string") {
    mapped.dataPagamento = toDDMMYYYY(mapped.dataPagamento);
  }
  if (raw.aluno && typeof raw.aluno === "object") {
    const a = raw.aluno as Record<string, unknown>;
    mapped.alunoNome = String(a.nome || "");
    mapped.alunoResponsavel = String(a.responsavel || "");
    mapped.alunoSexo = String(a.sexo || "");
  }
  return mapped as unknown as Mensalidade;
}

function mensalidadeToApi(m: Record<string, unknown>): Record<string, unknown> {
  const clean = { ...m };
  delete clean.id;
  delete clean.createdAt;
  delete clean.updatedAt;
  delete clean.alunoNome;
  delete clean.alunoResponsavel;
  delete clean.alunoSexo;
  return mapKeys(clean, toSnake);
}

export async function fetchMensalidades(): Promise<Mensalidade[]> {
  const { data } = await api.get("/mensalidades");
  return (data as unknown[]).map((m) => mensalidadeFromApi(m as Record<string, unknown>));
}

export async function createMensalidade(m: Partial<Mensalidade>): Promise<Mensalidade> {
  const { data } = await api.post("/mensalidades", mensalidadeToApi(m));
  return mensalidadeFromApi(data as Record<string, unknown>);
}

export async function updateMensalidade(id: string, m: Partial<Mensalidade>): Promise<Mensalidade> {
  const { data } = await api.put(`/mensalidades/${id}`, mensalidadeToApi(m));
  return mensalidadeFromApi(data as Record<string, unknown>);
}

export async function verificarVencidas(): Promise<number> {
  const { data } = await api.post("/mensalidades/verificar-vencidas");
  return data.atualizadas;
}

export async function deleteMensalidade(id: string): Promise<void> {
  await api.delete(`/mensalidades/${id}`);
}

export async function gerarMensalidadesDoMes(
  mesReferencia: string,
  diaVencimento = 10,
): Promise<number> {
  const [alunos, existentes] = await Promise.all([
    fetchAlunos(),
    fetchMensalidades(),
  ]);

  const jaExistentes = new Set(
    existentes
      .filter((m) => m.mesReferencia === mesReferencia)
      .map((m) => m.alunoId),
  );

  const [mes, ano] = mesReferencia.split("/");
  const dataVencimento = `${ano}-${mes}-${String(diaVencimento).padStart(2, "0")}`;

  let criadas = 0;
  for (const a of alunos) {
    if (a.status !== "ativo") continue;
    if (jaExistentes.has(a.id)) continue;
    await createMensalidade({
      alunoId: a.id,
      mesReferencia,
      valor: Number(a.valorMensalidade) || 0,
      dataVencimento,
      status: "pendente",
    });
    criadas++;
  }
  return criadas;
}
