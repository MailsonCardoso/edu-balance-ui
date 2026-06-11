import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Eye, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { PageHeader, StatusBadge, EmptyState } from "@/components/shared/Primitives";
import { AlunoSheet } from "@/components/shared/AlunoSheet";
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
import { turmas } from "@/lib/mock-data";
import type { Aluno } from "@/lib/mock-data";
import { toast } from "sonner";
import { fetchAlunos, createAluno, updateAluno, deleteAluno } from "@/lib/api/alunos";
import { createMensalidade } from "@/lib/api/mensalidades";

export const Route = createFileRoute("/alunos/")({
  component: AlunosList,
});

function AlunosList() {
  const [data, setData] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [turma, setTurma] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sheetAluno, setSheetAluno] = useState<Aluno | null>(null);
  const [sheetMode, setSheetMode] = useState<"view" | "edit" | "create">("view");
  const [deleteTarget, setDeleteTarget] = useState<Aluno | null>(null);

  useEffect(() => {
    fetchAlunos()
      .then(setData)
      .catch(() => toast.error("Erro ao carregar alunos"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      data.filter(
        (a) =>
          (!q ||
            a.nome.toLowerCase().includes(q.toLowerCase()) ||
            a.responsavel.toLowerCase().includes(q.toLowerCase())) &&
          (turma === "all" || a.turma === turma) &&
          (statusFilter === "all" || a.status === statusFilter),
      ),
    [data, q, turma, statusFilter],
  );

  const handleSave = async (aluno: Aluno) => {
    try {
      if (sheetMode === "create") {
        const created = await createAluno(aluno);
        setData((d) => [...d, created]);
        if (aluno.valorMensalidade > 0) {
          try {
            const hoje = new Date();
            const mes = hoje.toLocaleDateString("pt-BR", { month: "long" });
            const mesRef = mes.charAt(0).toUpperCase() + mes.slice(1) + "/" + hoje.getFullYear();
            const dia = String(aluno.diaVencimento || 10).padStart(2, "0");
            const mesNum = String(hoje.getMonth() + 1).padStart(2, "0");
            await createMensalidade({
              alunoId: created.id,
              mesReferencia: mesRef,
              valor: aluno.valorMensalidade,
              dataVencimento: `${hoje.getFullYear()}-${mesNum}-${dia}`,
              status: "pendente",
            });
          } catch {
            toast.error("Erro ao criar mensalidade inicial");
          }
        }
        toast.success("Aluno cadastrado com sucesso!");
        setSheetAluno(null);
        setSheetMode("view");
      } else {
        const updated = await updateAluno(aluno.id, aluno);
        setData((d) => d.map((a) => (a.id === updated.id ? updated : a)));
        toast.success("Aluno atualizado com sucesso!");
        setSheetAluno(updated);
      }
    } catch {
      toast.error("Erro ao salvar aluno");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAluno(deleteTarget.id);
      setData((d) => d.filter((a) => a.id !== deleteTarget.id));
      toast.success("Aluno removido");
      setDeleteTarget(null);
    } catch {
      toast.error("Erro ao excluir aluno");
    }
  };

  return (
    <>
      <PageHeader
        title="Alunos"
        description={`${filtered.length} aluno(s) encontrado(s)`}
        actions={
          <Button
            onClick={() => {
              setSheetAluno(null);
              setSheetMode("create");
            }}
          >
            <Plus className="size-4" /> Novo aluno
          </Button>
        }
      />

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 flex flex-col md:flex-row gap-3 border-b border-border">
          <div className="relative flex-1">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome ou responsável..."
              className="pl-9 h-10"
            />
          </div>
          <Select value={turma} onValueChange={setTurma}>
            <SelectTrigger className="w-44 h-10">
              <SelectValue placeholder="Todas as turmas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as turmas</SelectItem>
              {turmas.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Nenhum aluno encontrado"
              description="Ajuste os filtros ou cadastre um novo aluno."
            />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Responsável</th>
                  <th className="px-4 py-3 font-medium">Turma</th>
                  <th className="px-4 py-3 font-medium">Telefone do responsável</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{a.nome}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.responsavel}</td>
                    <td className="px-4 py-3">{a.turma}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.telefoneResponsavel}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSheetAluno(a);
                            setSheetMode("view");
                          }}
                          className="p-1.5 rounded hover:bg-accent"
                          title="Visualizar"
                        >
                          <Eye className="size-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSheetAluno(a);
                            setSheetMode("edit");
                          }}
                          className="p-1.5 rounded hover:bg-accent"
                          title="Editar"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(a)}
                          className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                          title="Excluir"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AlunoSheet
        key={sheetMode + (sheetAluno?.id ?? "new")}
        open={!!sheetAluno || sheetMode === "create"}
        onOpenChange={(open) => {
          if (!open) {
            setSheetAluno(null);
            setSheetMode("view");
          }
        }}
        aluno={sheetAluno}
        mode={sheetMode}
        onSave={handleSave}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir aluno</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleteTarget?.nome}</strong>? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
