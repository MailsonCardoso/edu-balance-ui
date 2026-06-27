import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2, Plus, Search, MoreVertical, Pencil, Trash2, X, CheckCircle2, RotateCcw,
} from "lucide-react";
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
import { toast } from "sonner";
import { brl, fmtDate } from "@/lib/format";
import { fetchExpenses, createExpense, updateExpense, deleteExpense, pagarExpense, estornarExpense } from "@/lib/api/expenses";
import { fetchFinancialCategories } from "@/lib/api/financial-categories";
import type { Expense, FinancialCategory } from "@/lib/financeiro-types";
import { FORMA_PAGAMENTO_OPCOES, STATUS_DESPESA } from "@/lib/financeiro-types";

export const Route = createFileRoute("/financeiro/saidas")({
  component: Saidas,
});

function Saidas() {
  const [data, setData] = useState<Expense[]>([]);
  const [categorias, setCategorias] = useState<FinancialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("all");
  const [filtroStatus, setFiltroStatus] = useState("all");
  const [selected, setSelected] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState<{
    data: string;
    financial_category_id: string;
    descricao: string;
    fornecedor: string;
    valor: number;
    forma_pagamento: string;
    data_vencimento: string;
    data_pagamento: string;
    status: "pendente" | "pago" | "atrasado" | "cancelado";
    cost_center_id: string;
    observacoes: string;
  }>({
    data: "",
    financial_category_id: "",
    descricao: "",
    fornecedor: "",
    valor: 0,
    forma_pagamento: "",
    data_vencimento: "",
    data_pagamento: "",
    status: "pendente",
    cost_center_id: "",
    observacoes: "",
  });

  const [pagarOpen, setPagarOpen] = useState(false);
  const [pagarId, setPagarId] = useState("");
  const [pagarData, setPagarData] = useState({ data_pagamento: "", forma_pagamento: "" });

  const carregar = async () => {
    try {
      const [r, c] = await Promise.all([
        fetchExpenses(),
        fetchFinancialCategories("despesa"),
      ]);
      setData(r);
      setCategorias(c);
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
        (r) =>
          (!q || r.descricao.toLowerCase().includes(q.toLowerCase()) || (r.fornecedor || "").toLowerCase().includes(q.toLowerCase())) &&
          (filtroCategoria === "all" || r.financial_category_id === filtroCategoria) &&
          (filtroStatus === "all" || r.status === filtroStatus),
      ),
    [data, q, filtroCategoria, filtroStatus],
  );

  const totals = useMemo(
    () => ({
      pago: filtered.filter((r) => r.status === "pago").reduce((s, r) => s + r.valor, 0),
      pendente: filtered.filter((r) => r.status === "pendente").reduce((s, r) => s + r.valor, 0),
      vencido: filtered.filter((r) => r.status === "atrasado").reduce((s, r) => s + r.valor, 0),
    }),
    [filtered],
  );

  const abrirForm = (mode: "create" | "edit", item?: Expense) => {
    setFormMode(mode);
    if (mode === "edit" && item) {
      setFormData({
        data: item.data,
        financial_category_id: item.financial_category_id,
        descricao: item.descricao,
        fornecedor: item.fornecedor || "",
        valor: item.valor,
        forma_pagamento: item.forma_pagamento || "",
        data_vencimento: item.data_vencimento || "",
        data_pagamento: item.data_pagamento || "",
        status: item.status,
        cost_center_id: item.cost_center_id || "",
        observacoes: item.observacoes || "",
      });
    } else {
      setFormData({
        data: new Date().toISOString().split("T")[0],
        financial_category_id: "",
        descricao: "",
        fornecedor: "",
        valor: 0,
        forma_pagamento: "",
        data_vencimento: "",
        data_pagamento: "",
        status: "pendente",
        cost_center_id: "",
        observacoes: "",
      });
    }
    setFormOpen(true);
  };

  const salvarForm = async () => {
    try {
      if (formMode === "create") {
        await createExpense(formData);
        toast.success("Despesa registrada!");
      } else {
        await updateExpense(selected!.id, formData);
        toast.success("Despesa atualizada!");
      }
      setFormOpen(false);
      setSelected(null);
      await carregar();
    } catch {
      toast.error("Erro ao salvar despesa");
    }
  };

  const confirmarExclusao = async () => {
    if (!deleteTarget) return;
    try {
      await deleteExpense(deleteTarget.id);
      toast.success("Despesa excluída");
      setDeleteTarget(null);
      setSelected(null);
      await carregar();
    } catch {
      toast.error("Erro ao excluir despesa");
    }
  };

  const confirmarPagamento = async () => {
    try {
      await pagarExpense(pagarId, pagarData);
      toast.success("Pagamento registrado!");
      setPagarOpen(false);
      setSelected(null);
      await carregar();
    } catch {
      toast.error("Erro ao registrar pagamento");
    }
  };

  const confirmarEstorno = async () => {
    if (!selected) return;
    try {
      await estornarExpense(selected.id);
      toast.success("Pagamento estornado!");
      setSelected(null);
      await carregar();
    } catch {
      toast.error("Erro ao estornar pagamento");
    }
  };

  return (
    <>
      <PageHeader
        title="Saídas"
        description="Registro de despesas da instituição"
        actions={
          <Button onClick={() => abrirForm("create")}>
            <Plus className="size-4" /> Nova despesa
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Pago (filtro)</p>
          <p className="text-2xl font-semibold mt-1 text-success">{brl(totals.pago)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Pendente</p>
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
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar descrição ou fornecedor..." className="pl-9 h-10" />
          </div>
          <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger className="w-44 h-10">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categorias.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-36 h-10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {STATUS_DESPESA.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState title="Nenhuma despesa" description="Registre uma nova despesa para começar" />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium">Fornecedor</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Vencimento</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.id} className={`hover:bg-muted/30 ${r.status === "atrasado" ? "bg-destructive/5" : ""}`}>
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(r.data)}</td>
                    <td className="px-4 py-3">{r.category?.nome || "—"}</td>
                    <td className="px-4 py-3 font-medium">{r.descricao}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.fornecedor || "—"}</td>
                    <td className="px-4 py-3 font-medium">{brl(r.valor)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.data_vencimento ? fmtDate(r.data_vencimento) : "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(r)} className="p-1.5 rounded hover:bg-accent" title="Ações">
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
        open={!!selected && !formOpen && !deleteTarget && !pagarOpen}
        onOpenChange={(o) => { if (!o) setSelected(null); }}
        title={selected?.descricao || ""}
        description={selected ? `${brl(selected.valor)} — ${selected.status}` : ""}
        actions={
          selected
            ? [
                { label: "Editar", icon: <Pencil className="size-5" />, onClick: () => abrirForm("edit", selected) },
                ...(selected.status !== "pago"
                  ? [{
                      label: "Marcar como paga",
                      icon: <CheckCircle2 className="size-5" />,
                      onClick: () => {
                        setPagarId(selected.id);
                        setPagarData({ data_pagamento: new Date().toISOString().split("T")[0], forma_pagamento: selected.forma_pagamento || "" });
                        setPagarOpen(true);
                      },
                    }]
                  : []),
                ...(selected.status === "pago"
                  ? [{ label: "Estornar pagamento", icon: <RotateCcw className="size-5" />, onClick: confirmarEstorno }]
                  : []),
                { label: "Excluir", icon: <Trash2 className="size-5" />, destructive: true, onClick: () => setDeleteTarget(selected) },
              ]
            : []
        }
      />

      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-4 sm:p-6">
          <SheetHeader className="pr-8">
            <SheetTitle>{formMode === "create" ? "Nova despesa" : "Editar despesa"}</SheetTitle>
            <SheetDescription>Preencha os dados da despesa</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Data</label>
                <Input type="date" className="h-10" value={formData.data} onChange={(e) => setFormData((f) => ({ ...f, data: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Valor (R$)</label>
                <Input type="number" step="0.01" min="0" className="h-10" value={formData.valor || ""} onChange={(e) => setFormData((f) => ({ ...f, valor: Number(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Categoria</label>
              <Select value={formData.financial_category_id} onValueChange={(v) => setFormData((f) => ({ ...f, financial_category_id: v }))}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Descrição</label>
              <Input className="h-10" value={formData.descricao} onChange={(e) => setFormData((f) => ({ ...f, descricao: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fornecedor</label>
              <Input className="h-10" value={formData.fornecedor} onChange={(e) => setFormData((f) => ({ ...f, fornecedor: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Data vencimento</label>
                <Input type="date" className="h-10" value={formData.data_vencimento} onChange={(e) => setFormData((f) => ({ ...f, data_vencimento: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Forma de pagamento</label>
                <Select value={formData.forma_pagamento} onValueChange={(v) => setFormData((f) => ({ ...f, forma_pagamento: v }))}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhuma">Selecionar</SelectItem>
                    {FORMA_PAGAMENTO_OPCOES.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
              <Select value={formData.status} onValueChange={(v) => setFormData((f) => ({ ...f, status: v as typeof formData.status }))}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_DESPESA.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Observações</label>
              <textarea
                className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring min-h-[80px] resize-y"
                value={formData.observacoes}
                onChange={(e) => setFormData((f) => ({ ...f, observacoes: e.target.value }))}
              />
            </div>
          </div>
          <div className="sticky bottom-0 pt-4 pb-2 bg-background border-t border-border mt-6 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}><X className="size-4" /> Cancelar</Button>
            <Button onClick={salvarForm}>{formMode === "create" ? "Criar" : "Salvar"}</Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={pagarOpen} onOpenChange={(o) => { if (!o) setPagarOpen(false); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como paga</AlertDialogTitle>
            <AlertDialogDescription>Confirme o pagamento da despesa</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Data do pagamento</label>
              <Input type="date" className="h-10" value={pagarData.data_pagamento} onChange={(e) => setPagarData((f) => ({ ...f, data_pagamento: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Forma de pagamento</label>
              <Select value={pagarData.forma_pagamento} onValueChange={(v) => setPagarData((f) => ({ ...f, forma_pagamento: v }))}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhuma">Selecionar</SelectItem>
                  {FORMA_PAGAMENTO_OPCOES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarPagamento}>Confirmar pagamento</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir despesa</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Sim, excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
