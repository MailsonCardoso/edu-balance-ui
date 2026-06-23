import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Tags, Loader2, X, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader, EmptyState } from "@/components/shared/Primitives";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import {
  fetchCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  type Categoria,
} from "@/lib/api/categorias";

export const Route = createFileRoute("/gestao-categorias")({
  component: GestaoCategorias,
});

function GestaoCategorias() {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Categoria | null>(null);

  const queryClient = useQueryClient();

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ["categorias"],
    queryFn: fetchCategorias,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createCategoria(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      toast.success("Categoria criada com sucesso!");
      setNewName("");
    },
    onError: () => toast.error("Erro ao criar categoria"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      updateCategoria(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      toast.success("Categoria atualizada!");
      setEditingId(null);
      setEditName("");
    },
    onError: () => toast.error("Erro ao atualizar categoria"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      toast.success("Categoria excluída!");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Erro ao excluir categoria"),
  });

  const startEdit = (cat: Categoria) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  return (
    <>
      <PageHeader
        title="Categorias"
        description="Gerencie as categorias de notícias"
      />

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nova categoria..."
              className="h-10 max-w-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newName.trim()) {
                  createMutation.mutate(newName.trim());
                }
              }}
            />
            <Button
              onClick={() => {
                if (newName.trim()) createMutation.mutate(newName.trim());
              }}
              disabled={!newName.trim() || createMutation.isPending}
            >
              <Plus className="size-4" /> Adicionar
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : categorias.length === 0 ? (
            <EmptyState
              title="Nenhuma categoria"
              description="Adicione categorias para organizar as notícias."
              icon={<Tags className="size-6" />}
            />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="w-12 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categorias.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      {editingId === cat.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-9 max-w-xs"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && editName.trim()) {
                                updateMutation.mutate({
                                  id: cat.id,
                                  name: editName.trim(),
                                });
                              }
                              if (e.key === "Escape") cancelEdit();
                            }}
                          />
                          <button
                            onClick={() => {
                              if (editName.trim())
                                updateMutation.mutate({
                                  id: cat.id,
                                  name: editName.trim(),
                                });
                            }}
                            className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600"
                          >
                            <Check className="size-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-medium">{cat.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId !== cat.id && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(cat)}
                            className="p-1.5 rounded hover:bg-accent"
                            title="Editar"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(cat)}
                            className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                            title="Excluir"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir{" "}
              <strong>{deleteTarget?.name}</strong>? Notícias com esta
              categoria não serão afetadas.
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
