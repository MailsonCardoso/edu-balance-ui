import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Eye, History, Search } from "lucide-react";
import { PageHeader, StatusBadge, EmptyState } from "@/components/shared/Primitives";
import { mensalidades as mock } from "@/lib/mock-data";
import { brl, fmtDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/financeiro")({
  component: Financeiro,
});

function Financeiro() {
  const [data, setData] = useState(mock);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const filtered = useMemo(
    () =>
      data.filter(
        (m) =>
          (!q || m.alunoNome.toLowerCase().includes(q.toLowerCase()) || m.competencia.includes(q)) &&
          (!status || m.status === status),
      ),
    [data, q, status],
  );

  const registrar = (id: string) => {
    setData((d) => d.map((m) => (m.id === id ? { ...m, status: "pago" as const, valorPago: m.valor } : m)));
    toast.success("Pagamento registrado");
  };

  const totals = useMemo(
    () => ({
      pago: filtered.filter((m) => m.status === "pago").reduce((s, m) => s + (m.valorPago ?? 0), 0),
      pendente: filtered.filter((m) => m.status === "pendente" || m.status === "parcial").reduce((s, m) => s + (m.valor - (m.valorPago ?? 0)), 0),
      vencido: filtered.filter((m) => m.status === "vencido").reduce((s, m) => s + m.valor, 0),
    }),
    [filtered],
  );

  return (
    <>
      <PageHeader title="Financeiro" description="Mensalidades, pagamentos e histórico" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-5"><p className="text-sm text-muted-foreground">Recebido (filtro)</p><p className="text-2xl font-semibold mt-1 text-success">{brl(totals.pago)}</p></div>
        <div className="bg-card border border-border rounded-xl p-5"><p className="text-sm text-muted-foreground">A receber</p><p className="text-2xl font-semibold mt-1 text-warning">{brl(totals.pendente)}</p></div>
        <div className="bg-card border border-border rounded-xl p-5"><p className="text-sm text-muted-foreground">Vencido</p><p className="text-2xl font-semibold mt-1 text-destructive">{brl(totals.vencido)}</p></div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 flex flex-col md:flex-row gap-3 border-b border-border">
          <div className="relative flex-1">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar aluno ou competência..." className="w-full h-10 pl-9 pr-3 rounded-md bg-background border border-input text-sm outline-none focus:border-ring" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring">
            <option value="">Todos os status</option>
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
            <option value="vencido">Vencido</option>
            <option value="parcial">Parcial</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState title="Sem mensalidades" />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Aluno</th>
                  <th className="px-4 py-3 font-medium">Competência</th>
                  <th className="px-4 py-3 font-medium">Vencimento</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{m.alunoNome}</td>
                    <td className="px-4 py-3">{m.competencia}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(m.vencimento)}</td>
                    <td className="px-4 py-3 font-medium">{brl(m.valor)}{m.valorPago && m.status === "parcial" ? <span className="text-xs text-info ml-2">({brl(m.valorPago)} pago)</span> : null}</td>
                    <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toast.info(`Detalhes ${m.competencia}`)} className="p-1.5 rounded hover:bg-accent" title="Detalhes"><Eye className="size-4" /></button>
                        <button onClick={() => toast.info("Histórico do aluno")} className="p-1.5 rounded hover:bg-accent" title="Histórico"><History className="size-4" /></button>
                        {m.status !== "pago" && (
                          <button onClick={() => registrar(m.id)} className="p-1.5 rounded text-success hover:bg-success/10" title="Registrar pagamento"><CheckCircle2 className="size-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
