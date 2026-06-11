import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, History, Loader2, MoreVertical, Plus, Pencil, Search, Trash2, X } from "lucide-react";
import { PageHeader, StatusBadge, EmptyState } from "@/components/shared/Primitives";
import { ActionSheet } from "@/components/shared/ActionSheet";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import type { Mensalidade, Aluno, FormaPagamento } from "@/lib/mock-data";
import { brl, fmtDate, maskDate } from "@/lib/format";
import { toast } from "sonner";
import { fetchAlunos } from "@/lib/api/alunos";
import { fetchMensalidades, createMensalidade, updateMensalidade, deleteMensalidade } from "@/lib/api/mensalidades";

export const Route = createFileRoute("/financeiro")({
  component: Financeiro,
});

const formaPagamentoLabel: Record<string, string> = {
  pix: "Pix",
  debito: "Débito",
  credito: "Crédito",
};

function Financeiro() {
  const [data, setData] = useState<Mensalidade[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMensalidade, setSelectedMensalidade] = useState<Mensalidade | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Mensalidade | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState({
    alunoId: "",
    mesReferencia: "",
    valor: 0,
    dataVencimento: "",
    formaPagamento: "",
  });

  const [pagamentoOpen, setPagamentoOpen] = useState(false);
  const [pagamentoId, setPagamentoId] = useState("");
  const [pagamentoForma, setPagamentoForma] = useState("");

  const carregar = async () => {
    try {
      const [m, a] = await Promise.all([fetchMensalidades(), fetchAlunos()]);
      setData(m);
      setAlunos(a);
    } catch {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const filtered = useMemo(
    () =>
      data.filter(
        (m) =>
          (!q ||
            (m.alunoNome || "").toLowerCase().includes(q.toLowerCase()) ||
            m.mesReferencia.includes(q)) &&
          (statusFilter === "all" || m.status === statusFilter),
      ),
    [data, q, statusFilter],
  );

  const totals = useMemo(
    () => ({
      pago: filtered.filter((m) => m.status === "pago").reduce((s, m) => s + m.valor, 0),
      pendente: filtered
        .filter((m) => m.status === "pendente" || m.status === "atrasado")
        .reduce((s, m) => s + m.valor, 0),
      vencido: filtered.filter((m) => m.status === "atrasado").reduce((s, m) => s + m.valor, 0),
    }),
    [filtered],
  );

  const abrirForm = (mode: "create" | "edit", mensalidade?: Mensalidade) => {
    setFormMode(mode);
    if (mode === "edit" && mensalidade) {
      setFormData({
        alunoId: mensalidade.alunoId,
        mesReferencia: mensalidade.mesReferencia,
        valor: mensalidade.valor,
        dataVencimento: mensalidade.dataVencimento,
        formaPagamento: mensalidade.formaPagamento ?? "",
      });
    } else {
      setFormData({ alunoId: "", mesReferencia: "", valor: 0, dataVencimento: "", formaPagamento: "" });
    }
    setFormOpen(true);
  };

  const toIsoDate = (ddmmaaa: string) => {
    const partes = ddmmaaa.split("/");
    if (partes.length === 3) return `${partes[2]}-${partes[1]}-${partes[0]}`;
    return ddmmaaa;
  };

  const salvarForm = async () => {
    try {
      const dataVencimento = toIsoDate(formData.dataVencimento);
      if (formMode === "create") {
        await createMensalidade({
          alunoId: formData.alunoId,
          mesReferencia: formData.mesReferencia,
          valor: formData.valor,
          dataVencimento,
          status: "pendente",
          formaPagamento: (formData.formaPagamento || null) as FormaPagamento | null,
        });
        toast.success("Mensalidade criada!");
      } else {
        await updateMensalidade(selectedMensalidade!.id, {
          alunoId: formData.alunoId,
          mesReferencia: formData.mesReferencia,
          valor: formData.valor,
          dataVencimento,
          formaPagamento: (formData.formaPagamento || null) as FormaPagamento | null,
        });
        toast.success("Mensalidade atualizada!");
      }
      setFormOpen(false);
      setSelectedMensalidade(null);
      await carregar();
    } catch {
      toast.error("Erro ao salvar mensalidade");
    }
  };

  const confirmarPagamento = async () => {
    try {
      await updateMensalidade(pagamentoId, {
        status: "pago",
        dataPagamento: new Date().toISOString().split("T")[0],
        formaPagamento: (pagamentoForma || null) as FormaPagamento | null,
      });
      toast.success("Pagamento registrado!");
      setPagamentoOpen(false);
      setSelectedMensalidade(null);
      await carregar();
    } catch {
      toast.error("Erro ao registrar pagamento");
    }
  };

  const confirmarExclusao = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMensalidade(deleteTarget.id);
      toast.success("Mensalidade excluída");
      setDeleteTarget(null);
      setSelectedMensalidade(null);
      await carregar();
    } catch {
      toast.error("Erro ao excluir mensalidade");
    }
  };

  return (
    <>
      <PageHeader
        title="Financeiro"
        description="Mensalidades, pagamentos e histórico"
        actions={
          <Button onClick={() => abrirForm("create")}>
            <Plus className="size-4" /> Nova mensalidade
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Recebido (filtro)</p>
          <p className="text-2xl font-semibold mt-1 text-success">{brl(totals.pago)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">A receber</p>
          <p className="text-2xl font-semibold mt-1 text-warning">{brl(totals.pendente)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Vencido</p>
          <p className="text-2xl font-semibold mt-1 text-destructive">{brl(totals.vencido)}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 flex flex-col md:flex-row gap-3 border-b border-border">
          <div className="relative flex-1">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar aluno ou mês..."
              className="pl-9 h-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState title="Sem mensalidades" />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Aluno</th>
                  <th className="px-4 py-3 font-medium">Mês</th>
                  <th className="px-4 py-3 font-medium">Vencimento</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Pagamento</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{m.alunoNome || "—"}</td>
                    <td className="px-4 py-3">{m.mesReferencia}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(m.dataVencimento)}</td>
                    <td className="px-4 py-3 font-medium">{brl(m.valor)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {m.formaPagamento ? (
                        <span className="capitalize">{formaPagamentoLabel[m.formaPagamento]}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedMensalidade(m)}
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
        open={!!selectedMensalidade && !formOpen && !pagamentoOpen && !deleteTarget}
        onOpenChange={(open) => {
          if (!open) setSelectedMensalidade(null);
        }}
        title={
          selectedMensalidade
            ? `${selectedMensalidade.alunoNome || "—"} — ${selectedMensalidade.mesReferencia}`
            : ""
        }
        description={
          selectedMensalidade
            ? `${brl(selectedMensalidade.valor)} — ${selectedMensalidade.status.replace("_", " ")}`
            : ""
        }
        actions={
          selectedMensalidade
            ? [
                {
                  label: "Detalhes",
                  icon: <Eye className="size-5" />,
                  onClick: () =>
                    toast.info(`Detalhes da mensalidade de ${selectedMensalidade.mesReferencia}`),
                },
                {
                  label: "Editar",
                  icon: <Pencil className="size-5" />,
                  onClick: () => abrirForm("edit", selectedMensalidade),
                },
                ...(selectedMensalidade.status !== "pago"
                  ? [
                      {
                        label: "Registrar pagamento",
                        icon: <CheckCircle2 className="size-5" />,
                        onClick: () => {
                          setPagamentoId(selectedMensalidade.id);
                          setPagamentoForma(selectedMensalidade.formaPagamento ?? "");
                          setPagamentoOpen(true);
                        },
                      },
                    ]
                  : []),
                {
                  label: "Excluir",
                  icon: <Trash2 className="size-5" />,
                  destructive: true,
                  onClick: () => setDeleteTarget(selectedMensalidade),
                },
              ]
            : []
        }
      />

      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-4 sm:p-6">
          <SheetHeader className="pr-8">
            <SheetTitle>{formMode === "create" ? "Nova mensalidade" : "Editar mensalidade"}</SheetTitle>
            <SheetDescription>
              {formMode === "create"
                ? "Preencha os dados para criar uma nova mensalidade"
                : "Altere os dados da mensalidade"}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Aluno</label>
              <Select
                value={formData.alunoId}
                onValueChange={(v) => setFormData((f) => ({ ...f, alunoId: v }))}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecione um aluno..." />
                </SelectTrigger>
                <SelectContent>
                  {alunos.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mês referência</label>
              <Input
                className="h-10"
                placeholder="Ex: Junho/2026"
                value={formData.mesReferencia}
                onChange={(e) => setFormData((f) => ({ ...f, mesReferencia: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Valor (R$)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                className="h-10"
                placeholder="0,00"
                value={formData.valor || ""}
                onChange={(e) => setFormData((f) => ({ ...f, valor: Number(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Data vencimento</label>
              <Input
                className="h-10"
                placeholder="DD/MM/AAAA"
                value={formData.dataVencimento}
                onChange={(e) => {
                  const masked = maskDate(e.target.value);
                  setFormData((f) => ({ ...f, dataVencimento: masked }));
                }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Forma de pagamento</label>
              <Select
                value={formData.formaPagamento}
                onValueChange={(v) => setFormData((f) => ({ ...f, formaPagamento: v }))}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sem forma</SelectItem>
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="debito">Débito</SelectItem>
                  <SelectItem value="credito">Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="sticky bottom-0 pt-4 pb-2 bg-background border-t border-border mt-6 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              <X className="size-4" /> Cancelar
            </Button>
            <Button onClick={salvarForm}>
              {formMode === "create" ? "Criar" : "Salvar"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir mensalidade</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a mensalidade de{" "}
              <strong>{deleteTarget?.alunoNome || "—"}</strong> ({deleteTarget?.mesReferencia})?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={pagamentoOpen} onOpenChange={(o) => { if (!o) setPagamentoOpen(false); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registrar pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              Confirme o registro do pagamento e informe a forma de pagamento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Forma de pagamento
            </label>
            <Select value={pagamentoForma} onValueChange={setPagamentoForma}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sem forma</SelectItem>
                <SelectItem value="pix">Pix</SelectItem>
                <SelectItem value="debito">Débito</SelectItem>
                <SelectItem value="credito">Crédito</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarPagamento}>
              Confirmar pagamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
