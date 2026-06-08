import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
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

export const Route = createFileRoute("/alunos/")({
  component: AlunosList,
});

function AlunosList() {
  const [data, setData] = useState<Aluno[]>([]);
  const [q, setQ] = useState("");
  const [turma, setTurma] = useState("all");
  const [status, setStatus] = useState("all");
  const [sheetAluno, setSheetAluno] = useState<Aluno | null>(null);
  const [sheetMode, setSheetMode] = useState<"view" | "edit" | "create">("view");
  const [deleteAluno, setDeleteAluno] = useState<Aluno | null>(null);

  const filtered = useMemo(
    () =>
      data.filter(
        (a) =>
          (!q ||
            a.nome.toLowerCase().includes(q.toLowerCase()) ||
            a.responsavel.toLowerCase().includes(q.toLowerCase())) &&
          (turma === "all" || a.turma === turma) &&
          (status === "all" || a.status === status),
      ),
    [data, q, turma, status],
  );

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
          <Select value={status} onValueChange={setStatus}>
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
          {filtered.length === 0 ? (
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
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.situacao} />
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
        onSave={(updated) => {
          console.log("[DEBUG] onSave called with:", updated);
          setData((d) => {
            console.log("[DEBUG] setData updater, current length:", d.length);
            const exists = d.find((a) => a.id === updated.id);
            const next = exists ? d.map((a) => (a.id === updated.id ? updated : a)) : [...d, updated];
            console.log("[DEBUG] setData next length:", next.length);
            return next;
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
        onOpenChange={(open) => {
          if (!open) setDeleteAluno(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir aluno</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleteAluno?.nome}</strong>? Esta ação não
              pode ser desfeita.
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
