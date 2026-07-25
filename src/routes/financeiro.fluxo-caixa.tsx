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
import {
  fetchTransactions,
  createTransaction,
  deleteTransaction,
  type Transaction,
  type TransactionsResponse,
} from "@/lib/api/transactions";

export const Route = createFileRoute("/financeiro/fluxo-caixa")({
  component: FluxoCaixaPage,
});

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const categoriasSugeridas = [
  "Mensalidades", "Matrículas", "Doações", "Eventos", "Subvenções",
  "Folha de Pagamento", "Água", "Luz", "Telefone", "Manutenção",
  "Material Didático", "Alimentação", "Transporte", "Serviços Terceiros",
  "Impostos", "Outros",
];

function FluxoCaixaPage() {
  const hoje = new Date();
  const [mes, setMes] = useState(String(hoje.getMonth() + 1).padStart(2, "0"));
  const [ano, setAno] = useState(String(hoje.getFullYear()));
  const [data, setData] = useState<TransactionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    description: "",
    amount: 0,
    type: "entrada" as "entrada" | "saida",
    category_name: "",
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

  const filtered = useMemo(
    () =>
      data?.transactions.filter(
        (t) =>
          !q ||
          t.description.toLowerCase().includes(q.toLowerCase()) ||
          t.category_name.toLowerCase().includes(q.toLowerCase()),
      ) ?? [],
    [data, q],
  );

  const totais = useMemo(() => {
    const entradas = data?.transactions
      .filter((t) => t.type === "entrada")
      .reduce((s, t) => s + t.amount, 0) ?? 0;
    const saidas = data?.transactions
      .filter((t) => t.type === "saida")
      .reduce((s, t) => s + t.amount, 0) ?? 0;
    return { entradas, saidas };
  }, [data]);

  const saldoAtual = (data?.previous_balance ?? 0) + totais.entradas - totais.saidas;

  const anos = useMemo(() => {
    const atual = hoje.getFullYear();
    return Array.from({ length: 5 }, (_, i) => String(atual - 2 + i));
  }, []);

  const abrirForm = () => {
    setForm({
      description: "",
      amount: 0,
      type: "entrada",
      category_name: "",
      date: `${ano}-${mes}-01`,
    });
    setFormOpen(true);
  };

  const salvar = async () => {
    try {
      await createTransaction({
        ...form,
        amount: Number(form.amount),
      });
      toast.success("Transação criada!");
      setFormOpen(false);
      carregar(mes, ano);
    } catch {
      toast.error("Erro ao salvar transação");
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
          <Button onClick={abrirForm}>
            <Plus className="size-4" /> Nova transação
          </Button>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Wallet className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Saldo Anterior
                </span>
              </div>
              <p className="text-2xl font-semibold">{brl(data?.previous_balance ?? 0)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 text-success mb-1">
                <TrendingUp className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Entradas
                </span>
              </div>
              <p className="text-2xl font-semibold text-success">{brl(totais.entradas)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 text-destructive mb-1">
                <TrendingDown className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Saídas
                </span>
              </div>
              <p className="text-2xl font-semibold text-destructive">{brl(totais.saidas)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 text-info mb-1">
                <PiggyBank className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Saldo Atual
                </span>
              </div>
              <p
                className={`text-2xl font-semibold ${
                  saldoAtual >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {brl(saldoAtual)}
              </p>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border">
            <div className="p-4 flex gap-3 border-b border-border">
              <div className="relative flex-1">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar transação..."
                  className="pl-9 h-10"
                />
              </div>
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
                      <th className="px-4 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-muted-foreground">
                          {fmtDate(t.date)}
                        </td>
                        <td className="px-4 py-3 font-medium">{t.description}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {t.category_name}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium ${
                              t.type === "entrada"
                                ? "text-success"
                                : "text-destructive"
                            }`}
                          >
                            {t.type === "entrada" ? (
                              <ArrowUp className="size-3" />
                            ) : (
                              <ArrowDown className="size-3" />
                            )}
                            {t.type === "entrada" ? "Entrada" : "Saída"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums">
                          <span
                            className={
                              t.type === "entrada"
                                ? "text-success"
                                : "text-destructive"
                            }
                          >
                            {t.type === "entrada" ? "+" : "-"}
                            {brl(t.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setDeleteTarget(t)}
                            className="p-1.5 rounded hover:bg-accent text-destructive"
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
        </>
      )}

      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-4 sm:p-6">
          <SheetHeader className="pr-8">
            <SheetTitle>Nova transação</SheetTitle>
            <SheetDescription>
              Registre uma entrada ou saída no fluxo de caixa
            </SheetDescription>
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
                Descrição
              </label>
              <Input
                className="h-10"
                placeholder="Ex: Pagamento mensalidade"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: Number(e.target.value) || 0 }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Categoria
              </label>
              <Select
                value={form.category_name}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category_name: v }))
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoriasSugeridas.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Data
              </label>
              <Input
                type="date"
                className="h-10"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
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
              <strong>{deleteTarget?.description}</strong>? Esta ação não pode
              ser desfeita.
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
