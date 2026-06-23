import api from "@/lib/api";

export interface Documento {
  id: number;
  titulo: string;
  arquivo: string;
  tipo: "estatuto" | "transparencia";
  url: string;
  created_at: string;
}

export async function fetchDocumentos(tipo?: string): Promise<Documento[]> {
  const params = tipo ? { tipo } : {};
  const { data } = await api.get<{ data: Documento[] }>("/documentos", { params });
  return data.data;
}

export async function uploadDocumento(formData: FormData): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post("/documentos", formData);
  return data;
}

export async function updateDocumento(id: number, formData: FormData): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post(`/documentos/${id}`, formData);
  return data;
}

export async function deleteDocumento(id: number): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/documentos/${id}`);
  return data;
}
