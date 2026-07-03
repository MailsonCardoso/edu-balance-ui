import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Users, Loader2, Search } from "lucide-react";
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
  fetchAssociados,
  deleteAssociado,
  type AssociadoListItem,
} from "@/lib/api/associado";

export const Route = createFileRoute("/gestao-associados")({
  component: GestaoAssociados,
});

function GestaoAssociados() {
  const [q, setQ] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AssociadoListItem | null>(null);

  const queryClient = useQueryClient();

  const { data: associados = [], isLoading } = useQuery({
    queryKey: ["associados"],
    queryFn: fetchAssociados,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAssociado(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["associados"] });
      toast.success("Associado excluído com sucesso!");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Erro ao excluir associado"),
  });

  const filtered = q
    ? associados.filter(
        (a) =>
          a.nome.toLowerCase().includes(q.toLowerCase()) ||
          a.cpf.includes(q) ||
          a.email.toLowerCase().includes(q.toLowerCase()),
      )
    : associados;

  return (
    <>
      <PageHeader
        title="Gestão de Associados"
        description="Visualize e gerencie os associados cadastrados"
      />

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nome, CPF ou email..."
                className="h-10 pl-9"
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {filtered.length} de {associados.length} associados
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Nenhum associado encontrado"
              description={q ? "Tente outro termo de busca." : "Nenhum associado cadastrado ainda."}
              icon={<Users className="size-6" />}
            />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">CPF</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Telefone</th>
                  <th className="px-4 py-3 font-medium">Aluno</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Cadastro</th>
                  <th className="w-12 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{a.nome}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {a.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{a.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.telefone}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {a.aluno_nome || a.nome_aluno || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          a.status === "ativo"
                            ? "bg-emerald-50 text-emerald-700"
                            : a.status === "pendente"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{a.created_at}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDeleteTarget(a)}
                        className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                        title="Excluir"
                      >
                        <Trash2 className="size-4" />
                      </button>
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
            <AlertDialogTitle>Excluir associado</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleteTarget?.nome}</strong>?
              Esta ação não pode ser desfeita.
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
