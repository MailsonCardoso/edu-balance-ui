import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2, Plus, Search, MoreVertical, Pencil, Trash2, X,
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
import { fetchRevenues, createRevenue, updateRevenue, deleteRevenue } from "@/lib/api/revenues";
import { fetchFinancialCategories } from "@/lib/api/financial-categories";
import type { Revenue, FinancialCategory } from "@/lib/financeiro-types";
import { FORMA_PAGAMENTO_OPCOES, STATUS_RECEITA } from "@/lib/financeiro-types";

export const Route = createFileRoute("/financeiro/entradas")({
  component: Entradas,
});

function Entradas() {
  const [data, setData] = useState<Revenue[]>([]);
  const [categorias, setCategorias] = useState<FinancialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("all");
  const [filtroStatus, setFiltroStatus] = useState("all");
  const [selected, setSelected] = useState<Revenue | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Revenue | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState<{
    data: string;
    financial_category_id: string;
    descricao: string;
    valor: number;
    forma_pagamento: string;
    cost_center_id: string;
    observacoes: string;
    status: "recebido" | "pendente" | "cancelado";
    data_recebimento: string;
  }>({
    data: "",
    financial_category_id: "",
    descricao: "",
    valor: 0,
    forma_pagamento: "",
    cost_center_id: "",
    observacoes: "",
    status: "recebido",
    data_recebimento: "",
  });

  const carregar = async () => {
    try {
      const [r, c] = await Promise.all([
        fetchRevenues(),
        fetchFinancialCategories("receita"),
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
          (!q || r.descricao.toLowerCase().includes(q.toLowerCase())) &&
          (filtroCategoria === "all" || r.financial_category_id === filtroCategoria) &&
          (filtroStatus === "all" || r.status === filtroStatus),
      ),
    [data, q, filtroCategoria, filtroStatus],
  );

  const totals = useMemo(
    () => ({
      recebido: filtered.filter((r) => r.status === "recebido").reduce((s, r) => s + r.valor, 0),
      pendente: filtered.filter((r) => r.status === "pendente").reduce((s, r) => s + r.valor, 0),
    }),
    [filtered],
  );

  const abrirForm = (mode: "create" | "edit", item?: Revenue) => {
    setFormMode(mode);
    if (mode === "edit" && item) {
      setFormData({
        data: item.data,
        financial_category_id: item.financial_category_id,
        descricao: item.descricao,
        valor: item.valor,
        forma_pagamento: item.forma_pagamento || "",
        cost_center_id: item.cost_center_id || "",
        observacoes: item.observacoes || "",
        status: item.status,
        data_recebimento: item.data_recebimento || "",
      });
    } else {
      setFormData({
        data: new Date().toISOString().split("T")[0],
        financial_category_id: "",
        descricao: "",
        valor: 0,
        forma_pagamento: "",
        cost_center_id: "",
        observacoes: "",
        status: "recebido",
        data_recebimento: new Date().toISOString().split("T")[0],
      });
    }
    setFormOpen(true);
  };

  const salvarForm = async () => {
    try {
      if (formMode === "create") {
        await createRevenue(formData);
        toast.success("Entrada registrada!");
      } else {
        await updateRevenue(selected!.id, formData);
        toast.success("Entrada atualizada!");
      }
      setFormOpen(false);
      setSelected(null);
      await carregar();
    } catch {
      toast.error("Erro ao salvar entrada");
    }
  };

  const confirmarExclusao = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRevenue(deleteTarget.id);
      toast.success("Entrada excluída");
      setDeleteTarget(null);
      setSelected(null);
      await carregar();
    } catch {
      toast.error("Erro ao excluir entrada");
    }
  };

  return (
    <>
      <PageHeader
        title="Entradas"
        description="Registro de receitas diversas"
        actions={
          <Button onClick={() => abrirForm("create")}>
            <Plus className="size-4" /> Nova entrada
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Recebido (filtro)</p>
          <p className="text-2xl font-semibold mt-1 text-success">{brl(totals.recebido)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">A receber</p>
          <p className="text-2xl font-semibold mt-1 text-warning">{brl(totals.pendente)}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 flex flex-col md:flex-row gap-3 border-b border-border">
          <div className="relative flex-1">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar descrição..." className="pl-9 h-10" />
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
              {STATUS_RECEITA.map((s) => (
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
            <EmptyState title="Nenhuma entrada" description="Registre uma nova entrada para começar" />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Forma</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(r.data)}</td>
                    <td className="px-4 py-3">{r.category?.nome || "—"}</td>
                    <td className="px-4 py-3 font-medium">{r.descricao}</td>
                    <td className="px-4 py-3 font-medium">{brl(r.valor)}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{r.forma_pagamento || "—"}</td>
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
        open={!!selected && !formOpen && !deleteTarget}
        onOpenChange={(o) => { if (!o) setSelected(null); }}
        title={selected?.descricao || ""}
        description={selected ? brl(selected.valor) : ""}
        actions={
          selected
            ? [
                { label: "Editar", icon: <Pencil className="size-5" />, onClick: () => abrirForm("edit", selected) },
                { label: "Excluir", icon: <Trash2 className="size-5" />, destructive: true, onClick: () => setDeleteTarget(selected) },
              ]
            : []
        }
      />

      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-4 sm:p-6">
          <SheetHeader className="pr-8">
            <SheetTitle>{formMode === "create" ? "Nova entrada" : "Editar entrada"}</SheetTitle>
            <SheetDescription>Preencha os dados da receita</SheetDescription>
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
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
              <Select value={formData.status} onValueChange={(v) => setFormData((f) => ({ ...f, status: v as typeof formData.status }))}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_RECEITA.map((s) => (
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir entrada</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir esta entrada? Esta ação não pode ser desfeita.</AlertDialogDescription>
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
