import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, FileDown, Loader2, Receipt, Smartphone, Ban, CheckCircle2, Clock, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/Primitives";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchAuditoria, type AuditoriaItem, type AuditoriaFilters } from "@/lib/api/auditoria";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const Route = createFileRoute("/gestao-auditoria")({
  component: GestaoAuditoria,
});

const statusBadge: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "bg-amber-50 text-amber-600" },
  approved: { label: "Aprovado", color: "bg-emerald-50 text-emerald-600" },
  rejected: { label: "Rejeitado", color: "bg-red-50 text-red-600" },
  cancelled: { label: "Cancelado", color: "bg-gray-50 text-gray-500" },
  refunded: { label: "Reembolsado", color: "bg-purple-50 text-purple-600" },
  charged_back: { label: "Estornado", color: "bg-orange-50 text-orange-600" },
  expired: { label: "Expirado", color: "bg-gray-50 text-gray-500" },
};

function formatDate(d: string | null): string {
  if (!d) return "-";
  const dt = new Date(d);
  return dt.toLocaleString("pt-BR");
}

function formatMoney(v: number | null): string {
  if (v === null || v === undefined) return "-";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function methodIcon(method: string | null) {
  if (method === "bank_transfer" || method === "pix") return <Smartphone className="size-3.5 text-emerald-500" />;
  if (method === "ticket" || method === "boleto") return <Receipt className="size-3.5 text-blue-500" />;
  return null;
}

function StatusIcon({ status }: { status: string }) {
  if (status === "approved") return <CheckCircle2 className="size-3.5 text-emerald-500" />;
  if (status === "pending") return <Clock className="size-3.5 text-amber-500" />;
  if (status === "rejected" || status === "cancelled" || status === "expired") return <Ban className="size-3.5 text-red-500" />;
  return <AlertCircle className="size-3.5 text-gray-400" />;
}

function GestaoAuditoria() {
  const [filters, setFilters] = useState<AuditoriaFilters>({ page: 1, per_page: 50 });
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["auditoria", filters],
    queryFn: () => fetchAuditoria(filters),
  });

  const setFilter = (key: keyof AuditoriaFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  const goToPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const gerarPDF = () => {
    const doc = new jsPDF("landscape", "mm", "a4");
    const rows = (data?.data ?? []).map((item: AuditoriaItem) => [
      item.aluno_nome || "-",
      item.aluno_cpf || "-",
      item.mes_referencia || "-",
      formatMoney(item.valor),
      statusBadge[item.status]?.label || item.status,
      item.payment_method || "-",
      item.banco_nome || item.issuer_id || "-",
      item.e2e_id || "-",
      formatDate(item.data_criacao),
      item.data_aprovacao ? formatDate(item.data_aprovacao) : "-",
    ]);

    doc.setFontSize(16);
    doc.text("Auditoria de Pagamentos", 14, 20);

    doc.setFontSize(9);
    doc.setTextColor(100);
    const infoParts: string[] = [];
    if (filters.data_inicio) infoParts.push(`De: ${filters.data_inicio}`);
    if (filters.data_fim) infoParts.push(`Até: ${filters.data_fim}`);
    if (filters.status) infoParts.push(`Status: ${filters.status}`);
    if (filters.payment_method) infoParts.push(`Método: ${filters.payment_method}`);
    if (infoParts.length > 0) doc.text(infoParts.join(" | "), 14, 27);

    autoTable(doc, {
      startY: 33,
      head: [["Aluno", "CPF", "Mês", "Valor", "Status", "Método", "Banco", "ID Pix", "Criação", "Aprovação"]],
      body: rows,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [214, 40, 40] },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 20 },
        2: { cellWidth: 18 },
        3: { cellWidth: 22, halign: "right" },
        4: { cellWidth: 18 },
        5: { cellWidth: 18 },
        6: { cellWidth: 14 },
        7: { cellWidth: 60 },
        8: { cellWidth: 28 },
        9: { cellWidth: 28 },
      },
    });

    doc.save(`auditoria-pagamentos-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <>
      <PageHeader title="Auditoria de Pagamentos" description="Histórico completo de todas as transações" />

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por aluno, CPF ou responsável..."
                className="pl-9 h-9 text-sm"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setFilter("search", searchInput);
                  }
                }}
              />
            </div>
            <Input
              type="date"
              className="h-9 w-[160px] text-sm"
              value={filters.data_inicio || ""}
              onChange={(e) => setFilter("data_inicio", e.target.value)}
              placeholder="Data início"
            />
            <Input
              type="date"
              className="h-9 w-[160px] text-sm"
              value={filters.data_fim || ""}
              onChange={(e) => setFilter("data_fim", e.target.value)}
              placeholder="Data fim"
            />
            <select
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground"
              value={filters.status || ""}
              onChange={(e) => setFilter("status", e.target.value)}
            >
              <option value="">Todos os status</option>
              {Object.entries(statusBadge).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground"
              value={filters.payment_method || ""}
              onChange={(e) => setFilter("payment_method", e.target.value)}
            >
              <option value="">Todos os métodos</option>
              <option value="bank_transfer">PIX</option>
              <option value="ticket">Boleto</option>
            </select>
            <Button variant="outline" size="sm" className="h-9" onClick={() => {
              setFilters({ page: 1, per_page: 50 });
              setSearchInput("");
            }}>
              Limpar
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : !data?.data.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Receipt className="size-12 mb-4 opacity-30" />
            <p className="text-sm font-medium">Nenhum pagamento encontrado</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-4 py-2 border-b border-border text-xs text-muted-foreground">
              <span>{data.total} registro(s)</span>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={gerarPDF}>
                <FileDown className="size-3.5" />
                Exportar PDF
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left py-3 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">Aluno</th>
                    <th className="text-left py-3 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">CPF</th>
                    <th className="text-left py-3 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">Mês</th>
                    <th className="text-right py-3 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">Valor</th>
                    <th className="text-center py-3 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">Status</th>
                    <th className="text-center py-3 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">Método</th>
                    <th className="text-left py-3 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">Banco</th>
                    <th className="text-left py-3 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">ID Pix</th>
                    <th className="text-left py-3 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">Criação</th>
                    <th className="text-left py-3 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wider">Aprovação</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((item: AuditoriaItem) => {
                    const badge = statusBadge[item.status] || { label: item.status, color: "bg-gray-50 text-gray-500" };
                    return (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors border-b border-border/50">
                        <td className="py-3 px-3 font-medium text-foreground max-w-[200px] truncate" title={item.aluno_nome || ""}>
                          {item.aluno_nome || "-"}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground font-mono text-xs">{item.aluno_cpf || "-"}</td>
                        <td className="py-3 px-3 text-muted-foreground">{item.mes_referencia || "-"}</td>
                        <td className="py-3 px-3 text-right font-semibold text-foreground">{formatMoney(item.valor)}</td>
                        <td className="py-3 px-3">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                              <StatusIcon status={item.status} />
                              {badge.label}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex justify-center">
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              {methodIcon(item.payment_method)}
                              {item.payment_method === "bank_transfer" ? "PIX" : item.payment_method || "-"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-xs text-muted-foreground">
                          {item.banco_nome || item.issuer_id || "-"}
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-muted-foreground max-w-[200px] truncate" title={item.e2e_id || ""}>
                          {item.e2e_id || "-"}
                        </td>
                        <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(item.data_criacao)}</td>
                        <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">{item.data_aprovacao ? formatDate(item.data_aprovacao) : "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {data.last_page > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Página {data.current_page} de {data.last_page}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={data.current_page <= 1}
                    onClick={() => goToPage(data.current_page - 1)}
                  >
                    <ArrowLeft className="size-3.5" />
                  </Button>
                  {Array.from({ length: Math.min(data.last_page, 5) }, (_, i) => {
                    const start = Math.max(1, data.current_page - 2);
                    const page = start + i;
                    if (page > data.last_page) return null;
                    return (
                      <Button
                        key={page}
                        variant={page === data.current_page ? "default" : "outline"}
                        size="sm"
                        className="h-8 w-8 p-0 text-xs"
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={data.current_page >= data.last_page}
                    onClick={() => goToPage(data.current_page + 1)}
                  >
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
