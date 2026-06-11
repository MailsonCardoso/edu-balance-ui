import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Clock, DollarSign, Eye, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { PageHeader, StatusBadge, StatCard, EmptyState } from "@/components/shared/Primitives";
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
import type { Aluno, Mensalidade } from "@/lib/mock-data";
import { brl } from "@/lib/format";
import { toast } from "sonner";
import { fetchAlunos, createAluno, updateAluno, deleteAluno as deleteAlunoApi } from "@/lib/api/alunos";
import { fetchMensalidades } from "@/lib/api/mensalidades";

export const Route = createFileRoute("/inadimplentes")({
  component: Inadimplentes,
});

function Inadimplentes() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [turma, setTurma] = useState("all");
  const [sheetAluno, setSheetAluno] = useState<Aluno | null>(null);
  const [sheetMode, setSheetMode] = useState<"view" | "edit" | "create">("view");
  const [deleteTarget, setDeleteTarget] = useState<Aluno | null>(null);

  useEffect(() => {
    Promise.all([fetchAlunos(), fetchMensalidades()])
      .then(([a, m]) => {
        setAlunos(a);
        setMensalidades(m);
      })
      .catch(() => toast.error("Erro ao carregar dados"))
      .finally(() => setLoading(false));
  }, []);

  const inadimplentes = useMemo(
    () =>
      alunos.filter(
        (a) =>
          a.situacao === "inadimplente" &&
          (!q ||
            a.nome.toLowerCase().includes(q.toLowerCase()) ||
            a.responsavel.toLowerCase().includes(q.toLowerCase())) &&
          (turma === "all" || a.turma === turma),
      ),
    [alunos, q, turma],
  );

  const agregado = useMemo(() => {
    const hoje = new Date();
    const mapa = new Map<string, { parcelas: number; maiorAtraso: number; total: number }>();

    for (const m of mensalidades) {
      if (m.status !== "pendente" && m.status !== "atrasado") continue;
      const venc = new Date(m.dataVencimento.split("/").reverse().join("-"));
      const atraso = Math.max(0, Math.floor((hoje.getTime() - venc.getTime()) / (1000 * 60 * 60 * 24)));
      const existente = mapa.get(m.alunoId);
      if (existente) {
        existente.parcelas += 1;
        existente.total += m.valor;
        if (atraso > existente.maiorAtraso) existente.maiorAtraso = atraso;
      } else {
        mapa.set(m.alunoId, { parcelas: 1, maiorAtraso: atraso, total: m.valor });
      }
    }
    return mapa;
  }, [mensalidades]);

  const totalDevido = useMemo(
    () => inadimplentes.reduce((acc, a) => acc + (agregado.get(a.id)?.total ?? 0), 0),
    [inadimplentes, agregado],
  );
  const maiorAtraso = useMemo(
    () => Math.max(0, ...inadimplentes.map((a) => agregado.get(a.id)?.maiorAtraso ?? 0)),
    [inadimplentes, agregado],
  );

  const handleSave = async (aluno: Aluno) => {
    try {
      if (sheetMode === "create") {
        const created = await createAluno(aluno);
        setAlunos((d) => [...d, created]);
        toast.success("Aluno cadastrado com sucesso!");
        setSheetAluno(null);
        setSheetMode("view");
      } else {
        const updated = await updateAluno(aluno.id, aluno);
        setAlunos((d) => d.map((a) => (a.id === updated.id ? updated : a)));
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
      await deleteAlunoApi(deleteTarget.id);
      setAlunos((d) => d.filter((a) => a.id !== deleteTarget.id));
      toast.success("Aluno removido");
      setDeleteTarget(null);
    } catch {
      toast.error("Erro ao excluir aluno");
    }
  };

  return (
    <>
      <PageHeader
        title="Inadimplentes"
        description={`${inadimplentes.length} aluno(s) com situação inadimplente`}
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total de inadimplentes"
          value={inadimplentes.length}
          icon={<AlertTriangle className="size-5" />}
          tone="destructive"
        />
        <StatCard
          label="Valor total devido"
          value={brl(totalDevido)}
          icon={<DollarSign className="size-5" />}
          tone="warning"
        />
        <StatCard
          label="Maior atraso"
          value={`${maiorAtraso}d`}
          icon={<Clock className="size-5" />}
          tone="info"
        />
      </div>

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
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : inadimplentes.length === 0 ? (
            <EmptyState
              title="Nenhum inadimplente"
              description="Todos os alunos estão com a situação financeira em dia!"
            />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Responsável</th>
                  <th className="px-4 py-3 font-medium">Turma</th>
                  <th className="px-4 py-3 font-medium">Telefone</th>
                  <th className="px-4 py-3 font-medium">Situação</th>
                  <th className="px-4 py-3 font-medium text-center">Parcelas em atraso</th>
                  <th className="px-4 py-3 font-medium text-center">Dias em atraso</th>
                  <th className="px-4 py-3 font-medium text-right">Valor devido</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inadimplentes.map((a) => {
                  const det = agregado.get(a.id);
                  return (
                    <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{a.nome}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.responsavel}</td>
                      <td className="px-4 py-3">{a.turma}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.telefone}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={a.situacao} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {det ? (
                          <span className="inline-flex items-center justify-center min-w-8 h-7 px-2 rounded-full bg-destructive/15 text-destructive text-xs font-semibold">
                            {det.parcelas}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-destructive font-medium">
                        {det ? `${det.maiorAtraso}d` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-destructive">
                        {det ? brl(det.total) : "—"}
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
                  );
                })}
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
