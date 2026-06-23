import api from "@/lib/api";

export interface Categoria {
  id: number;
  name: string;
}

export async function fetchCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<{ data: Categoria[] }>("/categorias");
  return data.data;
}

export async function createCategoria(
  name: string,
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post("/categorias", { name });
  return data;
}

export async function updateCategoria(
  id: number,
  name: string,
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.put(`/categorias/${id}`, { name });
  return data;
}

export async function deleteCategoria(
  id: number,
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/categorias/${id}`);
  return data;
}
