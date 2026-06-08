import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, History, Loader2, MoreVertical, Search } from "lucide-react";
import { PageHeader, StatusBadge, EmptyState } from "@/components/shared/Primitives";
import { ActionSheet } from "@/components/shared/ActionSheet";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Mensalidade } from "@/lib/mock-data";
import { brl, fmtDate } from "@/lib/format";
import { toast } from "sonner";
import { fetchMensalidades, updateMensalidade } from "@/lib/api/mensalidades";

export const Route = createFileRoute("/financeiro")({
  component: Financeiro,
});

function Financeiro() {
  const [data, setData] = useState<Mensalidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMensalidade, setSelectedMensalidade] = useState<Mensalidade | null>(null);

  useEffect(() => {
    fetchMensalidades()
      .then(setData)
      .catch(() => toast.error("Erro ao carregar mensalidades"))
      .finally(() => setLoading(false));
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

  const registrar = async (id: string) => {
    try {
      await updateMensalidade(id, { status: "pago", dataPagamento: new Date().toISOString().split("T")[0] });
      const updated = await fetchMensalidades();
      setData(updated);
      toast.success("Pagamento registrado");
      setSelectedMensalidade(null);
    } catch {
      toast.error("Erro ao registrar pagamento");
    }
  };

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

  return (
    <>
      <PageHeader title="Financeiro" description="Mensalidades, pagamentos e histórico" />

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
        open={!!selectedMensalidade}
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
                  label: "Histórico",
                  icon: <History className="size-5" />,
                  onClick: () =>
                    toast.info(`Histórico de pagamentos de ${selectedMensalidade.alunoNome || "aluno"}`),
                },
                ...(selectedMensalidade.status !== "pago"
                  ? [
                      {
                        label: "Registrar pagamento",
                        icon: <CheckCircle2 className="size-5" />,
                        onClick: () => registrar(selectedMensalidade.id),
                      },
                    ]
                  : []),
              ]
            : []
        }
      />
    </>
  );
}
