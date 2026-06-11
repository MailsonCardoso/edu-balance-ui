import api from "@/lib/api";

export interface OuvidoriaPayload {
  nome?: string;
  email?: string;
  tipo: string;
  mensagem: string;
  anonimo: boolean;
}

export interface OuvidoriaResponse {
  success: boolean;
  protocolo: string;
  message: string;
}

export async function enviarManifestacao(
  payload: OuvidoriaPayload
): Promise<OuvidoriaResponse> {
  const { data } = await api.post<OuvidoriaResponse>("/ouvidoria", payload);
  return data;
}

export interface OuvidoriaListItem {
  id: number;
  protocolo: string;
  tipo: string;
  mensagem: string;
  anonimo: boolean;
  nome: string | null;
  email: string | null;
  status: string;
  created_at: string;
}

export async function listarManifestacoes(): Promise<OuvidoriaListItem[]> {
  const { data } = await api.get<{ data: OuvidoriaListItem[] }>("/ouvidoria");
  return data.data;
}
