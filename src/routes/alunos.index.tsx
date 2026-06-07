import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { PageHeader, StatusBadge, EmptyState } from "@/components/shared/Primitives";
import { AlunoSheet } from "@/components/shared/AlunoSheet";
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
import { alunos as mockAlunos, turmas } from "@/lib/mock-data";
import type { Aluno } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/alunos/")({
  component: AlunosList,
});

function AlunosList() {
  const [data, setData] = useState(mockAlunos);
  const [q, setQ] = useState("");
  const [turma, setTurma] = useState("");
  const [status, setStatus] = useState("");
  const [sheetAluno, setSheetAluno] = useState<Aluno | null>(null);
  const [sheetMode, setSheetMode] = useState<"view" | "edit" | "create">("view");
  const [deleteAluno, setDeleteAluno] = useState<Aluno | null>(null);

  const filtered = useMemo(
    () =>
      data.filter(
        (a) =>
          (!q || a.nome.toLowerCase().includes(q.toLowerCase()) || a.responsavel.toLowerCase().includes(q.toLowerCase())) &&
          (!turma || a.turma === turma) &&
          (!status || a.status === status),
      ),
    [data, q, turma, status],
  );

  return (
    <>
      <PageHeader
        title="Alunos"
        description={`${filtered.length} aluno(s) encontrado(s)`}
        actions={
          <button
            onClick={() => { setSheetAluno(null); setSheetMode("create"); }}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" /> Novo aluno
          </button>
        }
      />

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 flex flex-col md:flex-row gap-3 border-b border-border">
          <div className="relative flex-1">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome ou responsável..."
              className="w-full h-10 pl-9 pr-3 rounded-md bg-background border border-input text-sm outline-none focus:border-ring"
            />
          </div>
          <select
            value={turma}
            onChange={(e) => setTurma(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring"
          >
            <option value="">Todas as turmas</option>
            {turmas.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState title="Nenhum aluno encontrado" description="Ajuste os filtros ou cadastre um novo aluno." />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Responsável</th>
                  <th className="px-4 py-3 font-medium">Turma</th>
                  <th className="px-4 py-3 font-medium">Telefone</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Situação</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{a.nome}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.responsavel}</td>
                    <td className="px-4 py-3">{a.turma}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.telefone}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3"><StatusBadge status={a.situacao} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setSheetAluno(a); setSheetMode("view"); }}
                          className="p-1.5 rounded hover:bg-accent"
                          title="Visualizar"
                        >
                          <Eye className="size-4" />
                        </button>
                        <button
                          onClick={() => { setSheetAluno(a); setSheetMode("edit"); }}
                          className="p-1.5 rounded hover:bg-accent"
                          title="Editar"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleteAluno(a)}
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
        open={!!sheetAluno || sheetMode === "create"}
        onOpenChange={(open) => { if (!open) { setSheetAluno(null); setSheetMode("view"); } }}
        aluno={sheetAluno}
        mode={sheetMode}
        onSave={(updated) => {
          setData((d) => {
            const exists = d.find((a) => a.id === updated.id);
            return exists
              ? d.map((a) => (a.id === updated.id ? updated : a))
              : [...d, updated];
          });
          if (sheetMode === "create") {
            setSheetAluno(null);
            setSheetMode("view");
          } else {
            setSheetAluno(updated);
          }
        }}
      />

      <AlertDialog
        open={!!deleteAluno}
        onOpenChange={(open) => { if (!open) setDeleteAluno(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir aluno</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleteAluno?.nome}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteAluno) {
                  setData((d) => d.filter((a) => a.id !== deleteAluno.id));
                  toast.success("Aluno removido");
                }
                setDeleteAluno(null);
              }}
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
