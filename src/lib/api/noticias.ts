import api from "@/lib/api";

export interface Noticia {
  id: number;
  title: string;
  summary: string | null;
  content: string | null;
  category: string;
  image: string | null;
  author: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
}

export interface NoticiaPayload {
  title: string;
  summary?: string | null;
  content?: string | null;
  category: string;
  image?: string | null;
  author?: string | null;
  status?: string;
  published_at?: string;
}

export async function fetchNoticias(): Promise<Noticia[]> {
  const { data } = await api.get<{ data: Noticia[] }>("/noticias");
  return data.data;
}

export async function createNoticia(
  payload: NoticiaPayload,
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post("/noticias", payload);
  return data;
}

export async function updateNoticia(
  id: number,
  payload: Partial<NoticiaPayload>,
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.put(`/noticias/${id}`, payload);
  return data;
}

export async function deleteNoticia(
  id: number,
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/noticias/${id}`);
  return data;
}

export async function fetchNoticiasPublicas(): Promise<Noticia[]> {
  const { data } = await api.get<{ data: Noticia[] }>("/noticias/publicas");
  return data.data;
}
