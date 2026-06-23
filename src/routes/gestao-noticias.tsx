import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  Newspaper,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader, EmptyState } from "@/components/shared/Primitives";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { NoticiaSheet } from "@/components/shared/NoticiaSheet";
import {
  fetchNoticias,
  deleteNoticia,
  type Noticia,
} from "@/lib/api/noticias";
import { fetchCategorias } from "@/lib/api/categorias";

export const Route = createFileRoute("/gestao-noticias")({
  component: GestaoNoticias,
});

const statusColor: Record<string, string> = {
  publicado: "text-emerald-600 bg-emerald-50",
  rascunho: "text-amber-600 bg-amber-50",
};

const statusLabel: Record<string, string> = {
  publicado: "Publicado",
  rascunho: "Rascunho",
};

function GestaoNoticias() {
  const [search, setSearch] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState<Noticia | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Noticia | null>(null);

  const queryClient = useQueryClient();

  const { data: noticias = [], isLoading } = useQuery({
    queryKey: ["noticias"],
    queryFn: fetchNoticias,
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: fetchCategorias,
    staleTime: 60000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteNoticia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["noticias"] });
      toast.success("Notícia excluída com sucesso!");
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error("Erro ao excluir notícia");
    },
  });

  const filtered = noticias.filter((item) => {
    if (filtroCategoria && item.category !== filtroCategoria) return false;
    if (filtroStatus && item.status !== filtroStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        item.title.toLowerCase().includes(q) ||
        item.summary?.toLowerCase().includes(q)
      )
        return true;
      return false;
    }
    return true;
  });

  const openCreate = () => {
    setEditItem(null);
    setSheetOpen(true);
  };

  const openEdit = (item: Noticia) => {
    setEditItem(item);
    setSheetOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Notícias"
        description="Gerencie as notícias do site"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Nova notícia
          </Button>
        }
      />

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 flex flex-col md:flex-row gap-3 border-b border-border">
          <div className="relative flex-1">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título..."
              className="pl-9 h-10"
            />
          </div>
          <Select
            value={filtroCategoria}
            onValueChange={setFiltroCategoria}
          >
            <SelectTrigger className="w-44 h-10">
              <SelectValue placeholder="Todas categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filtroStatus}
            onValueChange={setFiltroStatus}
          >
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="Todos status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="publicado">Publicado</SelectItem>
              <SelectItem value="rascunho">Rascunho</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Nenhuma notícia encontrada"
              description="Crie uma nova notícia para aparecer no site."
              icon={<Newspaper className="size-6" />}
            />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Título</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Publicação</th>
                  <th className="w-12 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => {
                  const stCls =
                    statusColor[item.status] || "text-gray-600 bg-gray-50";
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium max-w-xs truncate">
                        {item.title}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${stCls}`}
                        >
                          {statusLabel[item.status] || item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {item.published_at || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 rounded hover:bg-accent"
                            title="Visualizar / Editar"
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 rounded hover:bg-accent"
                            title="Editar"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                            title="Excluir"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <NoticiaSheet
        key={editItem?.id ?? "new"}
        open={sheetOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSheetOpen(false);
            setEditItem(null);
          }
        }}
        item={editItem}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["noticias"] });
          setSheetOpen(false);
          setEditItem(null);
        }}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir notícia</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir{" "}
              <strong>{deleteTarget?.title}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteTarget!.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
