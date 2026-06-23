import api from "@/lib/api";

const CHUNK_SIZE = 1024 * 1024; // 1MB per chunk

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

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export async function uploadDocumentoChunked(
  file: File,
  titulo: string,
  tipo: "estatuto" | "transparencia",
  onProgress?: (current: number, total: number) => void,
): Promise<{ success: boolean; message: string }> {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const chunkId = generateId();

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const blob = file.slice(start, end);

    const formData = new FormData();
    formData.append("chunk", blob, `chunk_${i}`);
    formData.append("chunk_index", String(i));
    formData.append("total_chunks", String(totalChunks));
    formData.append("chunk_id", chunkId);
    formData.append("titulo", titulo);
    formData.append("tipo", tipo);
    formData.append("filename", file.name);

    const { data } = await api.post("/documentos/chunks", formData);
    onProgress?.(i + 1, totalChunks);

    if (data.completed) return data;
  }

  return { success: true, message: "Documento enviado com sucesso." };
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
