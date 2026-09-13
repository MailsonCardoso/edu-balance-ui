import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  Search,
  X,
  ArrowDown,
  ArrowUp,
  Wallet,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Lock,
  LockKeyhole,
  Link2,
  Download,
  FileText,
  FileSpreadsheet,
  HandCoins,
} from "lucide-react";
import { PageHeader, EmptyState } from "@/components/shared/Primitives";
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
import { brl, fmtDate } from "@/lib/format";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  fetchTransactions,
  createTransaction,
  deleteTransaction,
  closeMonth as apiCloseMonth,
  type Transaction,
  type TransactionsResponse,
} from "@/lib/api/transactions";
import { fetchCategories, type FinancialCategory } from "@/lib/api/financial-categories";
import { fetchMensalidades } from "@/lib/api/mensalidades";
import type { Mensalidade, OrigemPagamento } from "@/lib/mock-data";

export const Route = createFileRoute("/financeiro/fluxo-caixa")({
  component: FluxoCaixaPage,
});

const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const origemConfig: Record<string, { label: string; className: string }> = {
  mercadopago: { label: "Mercado Pago", className: "bg-sky-50 text-sky-700" },
  caixa: { label: "Caixa", className: "bg-blue-50 text-blue-700" },
  admin: { label: "Admin", className: "bg-gray-100 text-gray-600" },
  pix_manual: { label: "PIX", className: "bg-emerald-50 text-emerald-700" },
  dinheiro: { label: "Dinheiro", className: "bg-amber-50 text-amber-700" },
  transferencia: { label: "Transferência", className: "bg-purple-50 text-purple-700" },
};

const mesesNomes = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function normalizaMesRef(ref: string): string {
  const trim = ref.trim();
  if (/^\d{2}\/\d{4}$/.test(trim)) return trim;
  const lower = trim.toLowerCase();
  for (let i = 0; i < mesesNomes.length; i++) {
    if (lower.startsWith(mesesNomes[i])) {
      const ano = lower.match(/\d{4}/)?.[0];
      if (ano) return `${String(i + 1).padStart(2, "0")}/${ano}`;
    }
  }
  return trim;
}

function FluxoCaixaPage() {
  const hoje = new Date();
  const [mes, setMes] = useState(String(hoje.getMonth() + 1).padStart(2, "0"));
  const [ano, setAno] = useState(String(hoje.getFullYear()));
  const [data, setData] = useState<TransactionsResponse | null>(null);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    description: "",
    amount: 0,
    type: "entrada" as "entrada" | "saida",
    financial_category_id: "",
    date: "",
  });

  const carregar = async (m: string, a: string) => {
    setLoading(true);
    try {
      const d = await fetchTransactions(Number(m), Number(a));
      setData(d);
    } catch {
      toast.error("Erro ao carregar fluxo de caixa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar(mes, ano);
  }, [mes, ano]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchMensalidades()
      .then(setMensalidades)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [q, mes, ano]);

  const origemPorId = useMemo(() => {
    const map = new Map<number, OrigemPagamento>();
    for (const m of mensalidades) {
      if (m.origem) map.set(Number(m.id), m.origem);
    }
    return map;
  }, [mensalidades]);

  const refMes = `${mes}/${ano}`;
  const aReceber = useMemo(() => {
    return mensalidades
      .filter(
        (m) =>
          normalizaMesRef(m.mesReferencia) === refMes &&
          (m.status === "pendente" || m.status === "atrasado"),
      )
      .reduce((s, m) => s + m.valor, 0);
  }, [mensalidades, refMes]);

  const filtered = useMemo(
    () =>
      data?.transactions.filter(
        (t) =>
          !q ||
          t.description.toLowerCase().includes(q.toLowerCase()) ||
          (t.category?.nome ?? "").toLowerCase().includes(q.toLowerCase()),
      ) ?? [],
    [data, q],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = useMemo(
    () => filtered.slice((page - 1) * perPage, page * perPage),
    [filtered, page, perPage],
  );

  const linhasExport = useMemo(
    () =>
      filtered.map((t) => ({
        Data: t.date,
        Descricao: t.description,
        Categoria: t.category?.nome ?? t.category_name ?? "",
        Tipo: t.type === "entrada" ? "Entrada" : "Saída",
        Origem:
          t.source_type === "mensalidade" && t.source_id
            ? (origemConfig[origemPorId.get(t.source_id) ?? ""]?.label ?? "")
            : "",
        Valor: Number(t.amount),
      })),
    [filtered, origemPorId],
  );

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(`Fluxo de Caixa - ${meses[Number(mes) - 1]} ${ano}`, 14, 16);
    autoTable(doc, {
      head: [["Data", "Descrição", "Categoria", "Tipo", "Origem", "Valor (R$)"]],
      body: linhasExport.map((l) => [
        l.Data,
        l.Descricao,
        l.Categoria,
        l.Tipo,
        l.Origem,
        l.Valor.toFixed(2).replace(".", ","),
      ]),
      startY: 24,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 118, 110] },
    });
    doc.save(`fluxo-caixa-${mes}-${ano}.pdf`);
  };

  const exportarXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(
      linhasExport.map((l) => ({
        ...l,
        Valor: l.Valor.toFixed(2).replace(".", ","),
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fluxo de Caixa");
    XLSX.writeFile(wb, `fluxo-caixa-${mes}-${ano}.xlsx`);
  };

  const exportarCSV = () => {
    const rows = linhasExport.map((l) => ({
      Data: l.Data,
      Descrição: l.Descricao,
      Categoria: l.Categoria,
      Tipo: l.Tipo,
      Origem: l.Origem,
      Valor: l.Valor.toFixed(2).replace(".", ","),
    }));
    const csv = [
      Object.keys(rows[0] ?? {}).join(";"),
      ...rows.map((r) => Object.values(r).join(";")),
    ].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fluxo-caixa-${mes}-${ano}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totais = useMemo(() => {
    const entradas =
      data?.transactions
        .filter((t) => t.type === "entrada")
        .reduce((s, t) => s + Number(t.amount), 0) ?? 0;
    const saidas =
      data?.transactions
        .filter((t) => t.type === "saida")
        .reduce((s, t) => s + Number(t.amount), 0) ?? 0;
    return { entradas, saidas };
  }, [data]);

  const saldoAtual =
    data?.is_closed && data?.closing_balance != null
      ? data.closing_balance
      : (data?.previous_balance ?? 0) + totais.entradas - totais.saidas;

  const anos = useMemo(() => {
    const atual = hoje.getFullYear();
    return Array.from({ length: 5 }, (_, i) => String(atual - 2 + i));
  }, []);

  const abrirForm = () => {
    setForm({
      description: "",
      amount: 0,
      type: "entrada",
      financial_category_id: "",
      date: `${ano}-${mes}-01`,
    });
    setFormOpen(true);
  };

  const salvar = async () => {
    try {
      const catId = form.financial_category_id ? Number(form.financial_category_id) : null;
      const catName = categories.find((c) => c.id === catId)?.nome || "";
      await createTransaction({
        description: form.description,
        amount: Number(form.amount),
        type: form.type,
        category_name: catName,
        financial_category_id: catId,
        date: form.date,
      });
      toast.success("Transação criada!");
      setFormOpen(false);
      carregar(mes, ano);
    } catch {
      toast.error("Erro ao salvar transação");
    }
  };

  const [finalizando, setFinalizando] = useState(false);

  const finalizarMes = async () => {
    setFinalizando(true);
    try {
      const res = await apiCloseMonth(Number(mes), Number(ano));
      toast.success(`Mês finalizado! Saldo: ${brl(res.closing_balance)}`);
      carregar(mes, ano);
    } catch {
      toast.error("Erro ao finalizar mês");
    } finally {
      setFinalizando(false);
    }
  };

  const confirmarExclusao = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTransaction(deleteTarget.id);
      toast.success("Transação excluída");
      setDeleteTarget(null);
      carregar(mes, ano);
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  return (
    <>
      <PageHeader
        title="Fluxo de Caixa"
        description="Extrato mensal consolidado de entradas e saídas"
        actions={
          <div className="flex items-center gap-2">
            {data?.is_closed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-info/10 text-info border border-info/20">
                <LockKeyhole className="size-3.5" />
                Mês Finalizado
              </span>
            ) : (
              <Button variant="outline" onClick={finalizarMes} disabled={finalizando || loading}>
                {finalizando ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Lock className="size-4" />
                )}
                Finalizar Mês
              </Button>
            )}
            <Button onClick={abrirForm} disabled={data?.is_closed}>
              <Plus className="size-4" /> Nova transação
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-3 mb-6">
        <Select value={mes} onValueChange={setMes}>
          <SelectTrigger className="w-44 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {meses.map((label, i) => (
              <SelectItem key={i} value={String(i + 1).padStart(2, "0")}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={ano} onValueChange={setAno}>
          <SelectTrigger className="w-24 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {anos.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Wallet className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Saldo Anterior</span>
              </div>
              <p className="text-2xl font-semibold">{brl(data?.previous_balance ?? 0)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 text-success mb-1">
                <TrendingUp className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Entradas</span>
              </div>
              <p className="text-2xl font-semibold text-success">{brl(totais.entradas)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 text-destructive mb-1">
                <TrendingDown className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Saídas</span>
              </div>
              <p className="text-2xl font-semibold text-destructive">{brl(totais.saidas)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 text-info mb-1">
                <PiggyBank className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Saldo Atual</span>
              </div>
              <p
                className={`text-2xl font-semibold ${
                  saldoAtual >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {brl(saldoAtual)}
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 text-info mb-1">
                <HandCoins className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wide">A Receber</span>
              </div>
              <p className="text-2xl font-semibold text-info">{brl(aReceber)}</p>
              <p className="text-xs text-muted-foreground mt-1">Mensalidades pendentes do mês</p>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border">
            <div className="p-4 flex flex-wrap gap-3 border-b border-border">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar transação..."
                  className="pl-9 h-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={exportarPDF}
                disabled={!filtered.length}
                className="shrink-0"
                title="Exportar PDF"
              >
                <FileText className="size-4" /> PDF
              </Button>
              <Button
                variant="outline"
                onClick={exportarXLSX}
                disabled={!filtered.length}
                className="shrink-0"
                title="Exportar Excel"
              >
                <FileSpreadsheet className="size-4" /> Excel
              </Button>
              <Button
                variant="outline"
                onClick={exportarCSV}
                disabled={!filtered.length}
                className="shrink-0"
                title="Exportar CSV"
              >
                <Download className="size-4" /> CSV
              </Button>
            </div>

            <div className="overflow-x-auto">
              {filtered.length === 0 ? (
                <EmptyState title="Nenhuma transação neste mês" />
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Data</th>
                      <th className="px-4 py-3 font-medium">Descrição</th>
                      <th className="px-4 py-3 font-medium">Categoria</th>
                      <th className="px-4 py-3 font-medium">Tipo</th>
                      <th className="px-4 py-3 font-medium text-right">Valor</th>
                      {!data?.is_closed && <th className="px-4 py-3 w-12"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paged.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-muted-foreground">{fmtDate(t.date)}</td>
                        <td className="px-4 py-3 font-medium">{t.description}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {t.category?.nome || "—"}
                          {t.source_type === "mensalidade" && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-info/10 px-1.5 py-0.5 text-[10px] font-medium text-info border border-info/20">
                              <Link2 className="size-2.5" />
                              Mensalidade
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium ${
                              t.type === "entrada" ? "text-success" : "text-destructive"
                            }`}
                          >
                            {t.type === "entrada" ? (
                              <ArrowUp className="size-3" />
                            ) : (
                              <ArrowDown className="size-3" />
                            )}
                            {t.type === "entrada" ? "Entrada" : "Saída"}
                          </span>
                          {t.source_type === "mensalidade" &&
                            t.source_id &&
                            (() => {
                              const orig = origemPorId.get(t.source_id);
                              if (!orig) return null;
                              const cfg = origemConfig[orig] ?? {
                                label: orig,
                                className: "bg-gray-100 text-gray-600",
                              };
                              return (
                                <span
                                  className={`ml-2 inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium border ${cfg.className}`}
                                >
                                  {cfg.label}
                                </span>
                              );
                            })()}
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums">
                          <span
                            className={t.type === "entrada" ? "text-success" : "text-destructive"}
                          >
                            {t.type === "entrada" ? "+" : "-"}
                            {brl(t.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {!data?.is_closed && (
                            <button
                              onClick={() => {
                                if (t.source_type === "mensalidade") {
                                  toast.info(
                                    "Esta entrada é gerada pelo pagamento de uma mensalidade. Exclua a mensalidade em Financeiro para removê-la.",
                                  );
                                  return;
                                }
                                setDeleteTarget(t);
                              }}
                              className="p-1.5 rounded hover:bg-accent text-destructive"
                              title={
                                t.source_type === "mensalidade"
                                  ? "Vinculada a mensalidade"
                                  : "Excluir"
                              }
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {filtered.length > perPage && (
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {paged.length > 0 &&
                    `${(page - 1) * perPage + 1}-${Math.min(page * perPage, filtered.length)} de ${filtered.length} transações`}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Select
                    value={String(perPage)}
                    onValueChange={(v) => {
                      setPerPage(Number(v));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[90px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 20, 50].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} / pág
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      Anterior
                    </Button>
                    <span className="px-2 text-xs text-muted-foreground">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-4 sm:p-6">
          <SheetHeader className="pr-8">
            <SheetTitle>Nova transação</SheetTitle>
            <SheetDescription>Registre uma entrada ou saída no fluxo de caixa</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Tipo
              </label>
              <div className="flex gap-2">
                {(["entrada", "saida"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                      form.type === t
                        ? t === "entrada"
                          ? "border-success bg-success/5 text-success"
                          : "border-destructive bg-destructive/5 text-destructive"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    {t === "entrada" ? (
                      <TrendingUp className="size-4" />
                    ) : (
                      <TrendingDown className="size-4" />
                    )}
                    {t === "entrada" ? "Entrada" : "Saída"}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Categoria
              </label>
              <Select
                value={form.financial_category_id}
                onValueChange={(v) => setForm((f) => ({ ...f, financial_category_id: v }))}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((c) =>
                      form.type === "entrada" ? c.tipo === "receita" : c.tipo === "despesa",
                    )
                    .map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Descrição
              </label>
              <Input
                className="h-10"
                placeholder="Ex: Pagamento mensalidade"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Valor (R$)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                className="h-10"
                placeholder="0,00"
                value={form.amount || ""}
                onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Data
              </label>
              <Input
                type="date"
                className="h-10"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
          </div>
          <div className="sticky bottom-0 pt-4 pb-2 bg-background border-t border-border mt-6 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              <X className="size-4" /> Cancelar
            </Button>
            <Button onClick={salvar}>Criar</Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a transação{" "}
              <strong>{deleteTarget?.description}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExclusao}
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
