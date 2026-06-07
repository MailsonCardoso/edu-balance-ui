import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, MoreVertical, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { PageHeader, StatusBadge, EmptyState } from "@/components/shared/Primitives";
import { ActionSheet } from "@/components/shared/ActionSheet";
import { alunos as mockAlunos, turmas } from "@/lib/mock-data";
import type { Aluno } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/alunos/")({
  component: AlunosList,
});

function AlunosList() {
  const navigate = useNavigate();
  const [data, setData] = useState(mockAlunos);
  const [q, setQ] = useState("");
  const [turma, setTurma] = useState("");
  const [status, setStatus] = useState("");
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);

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

  const remove = (id: string) => {
    setData((d) => d.filter((a) => a.id !== id));
    toast.success("Aluno removido");
  };

  return (
    <>
      <PageHeader
        title="Alunos"
        description={`${filtered.length} aluno(s) encontrado(s)`}
        actions={
          <Link
            to="/alunos/novo"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" /> Novo aluno
          </Link>
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
                  <th className="px-4 py-3 w-12"></th>
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
                      <button
                        onClick={() => setSelectedAluno(a)}
                        className="p-1.5 rounded hover:bg-accent"
                        title="Ações"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ActionSheet
        open={!!selectedAluno}
        onOpenChange={(open) => { if (!open) setSelectedAluno(null); }}
        title={selectedAluno?.nome ?? ""}
        description="Ações disponíveis para este aluno"
        actions={
          selectedAluno
            ? [
                {
                  label: "Visualizar",
                  icon: <Eye className="size-5" />,
                  onClick: () => navigate({ to: "/alunos/$id", params: { id: selectedAluno.id } }),
                },
                {
                  label: "Editar",
                  icon: <Pencil className="size-5" />,
                  onClick: () => navigate({ to: "/alunos/$id", params: { id: selectedAluno.id } }),
                },
                {
                  label: "Excluir",
                  icon: <Trash2 className="size-5" />,
                  onClick: () => remove(selectedAluno.id),
                  destructive: true,
                },
              ]
            : []
        }
      />
    </>
  );
}
