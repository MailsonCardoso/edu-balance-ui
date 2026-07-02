import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Wallet, CalendarClock, Users, UserX, TrendingUp, Percent } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { PageHeader, StatCard } from "@/components/shared/Primitives";
import { brl, fmtDate } from "@/lib/format";
import { fetchAlunos } from "@/lib/api/alunos";
import { fetchMensalidades } from "@/lib/api/mensalidades";
import type { Mensalidade } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function ChartCard({
  title,
  subtitle,
  children,
  index = 0,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  index?: number;
}) {
  return (
    <div
      className="bg-card rounded-xl border border-border p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 animate-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="mb-4">
        <h3 className="font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="h-64 w-full min-w-0">{children}</div>
    </div>
  );
}

const axisStyle = { fontSize: 12, fill: "var(--muted-foreground)" };

function parseDataBr(dateStr: string): Date {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split("/");
    return new Date(+y, +m - 1, +d);
  }
  return new Date(dateStr);
}

function mesAno(d: Date): string {
  return d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }).replace(" de ", "/");
}

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [alunos, setAlunos] = useState<Awaited<ReturnType<typeof fetchAlunos>>>([]);
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);

  useEffect(() => {
    Promise.all([fetchAlunos(), fetchMensalidades()])
      .then(([a, m]) => { setAlunos(a); setMensalidades(m); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const ativos = alunos.filter((a) => a.status === "ativo");
    const inadimplentes = alunos.filter((a) => a.situacao === "inadimplente");
    const agora = new Date();
    const mesCorrente = agora.getMonth();
    const anoCorrente = agora.getFullYear();

    const recebidoMes = mensalidades
      .filter((m) => {
        if (m.status !== "pago" || !m.dataPagamento) return false;
        const d = parseDataBr(m.dataPagamento);
        return d.getMonth() === mesCorrente && d.getFullYear() === anoCorrente;
      })
      .reduce((s, m) => s + m.valor, 0);

    const aberto = mensalidades
      .filter((m) => m.status === "pendente")
      .reduce((s, m) => s + m.valor, 0);

    const vencido = mensalidades
      .filter((m) => m.status === "atrasado")
      .reduce((s, m) => s + m.valor, 0);

    const totalMensalidadesAtivas = mensalidades
      .filter((m) => m.status !== "pago")
      .reduce((s, m) => s + m.valor, 0);

    const ticketMedio = ativos.length > 0
      ? mensalidades.filter((m) => m.status !== "pago").reduce((s, m) => s + m.valor, 0) / ativos.length
      : 0;

    const taxaAdimplencia = ativos.length > 0
      ? Math.round(((ativos.length - inadimplentes.length) / ativos.length) * 100)
      : 0;

    return {
      totalRecebido: recebidoMes,
      totalAberto: aberto,
      totalVencido: vencido,
      alunosAtivos: ativos.length,
      alunosInadimplentes: inadimplentes.length,
      ticketMedio,
      taxaAdimplencia,
    };
  }, [alunos, mensalidades]);

  const chartData = useMemo(() => {
    const meses: Record<string, number> = {};
    const anos: Record<string, number> = {};
    const inadimplenciaPorMes: Record<string, { total: number; atrasados: number }> = {};

    for (const m of mensalidades) {
      if (m.status === "pago" && m.dataPagamento) {
        const d = parseDataBr(m.dataPagamento);
        const label = mesAno(d);
        meses[label] = (meses[label] || 0) + m.valor;
        const anoLabel = String(d.getFullYear());
        anos[anoLabel] = (anos[anoLabel] || 0) + m.valor;
      }

      const venc = parseDataBr(m.dataVencimento);
      const vencLabel = mesAno(venc);
      if (!inadimplenciaPorMes[vencLabel]) {
        inadimplenciaPorMes[vencLabel] = { total: 0, atrasados: 0 };
      }
      inadimplenciaPorMes[vencLabel].total += m.valor;
      if (m.status === "atrasado") {
        inadimplenciaPorMes[vencLabel].atrasados += m.valor;
      }
    }

    const receitaMensal = Object.entries(meses)
      .map(([mes, receita]) => ({ mes, receita }))
      .sort((a, b) => a.mes.localeCompare(b.mes));

    const receitaAnual = Object.entries(anos)
      .map(([ano, receita]) => ({ ano, receita }))
      .sort((a, b) => a.ano.localeCompare(b.ano));

    const inadimplencia = Object.entries(inadimplenciaPorMes)
      .map(([mes, v]) => ({
        mes,
        percentual: v.total > 0 ? Math.round((v.atrasados / v.total) * 100) : 0,
      }))
      .sort((a, b) => a.mes.localeCompare(b.mes));

    return { receitaMensal, receitaAnual, inadimplencia };
  }, [mensalidades]);

  const pagamentosDiarios = useMemo(() => {
    const agora = new Date();
    const dias: Record<string, { pagos: number; pendentes: number }> = {};
    const diasNoMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).getDate();

    for (let i = 1; i <= diasNoMes; i++) {
      const chave = String(i).padStart(2, "0");
      dias[chave] = { pagos: 0, pendentes: 0 };
    }

    for (const m of mensalidades) {
      const venc = parseDataBr(m.dataVencimento);
      if (venc.getMonth() !== agora.getMonth() || venc.getFullYear() !== agora.getFullYear()) continue;
      const chave = String(venc.getDate()).padStart(2, "0");
      if (m.status === "pago") dias[chave].pagos += 1;
      else dias[chave].pendentes += 1;
    }

    return Object.entries(dias).map(([dia, v]) => ({ dia, ...v }));
  }, [mensalidades]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Dashboard" description="Visão geral das finanças da escola" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Recebido no mês"
          value={brl(stats.totalRecebido)}
          icon={<Wallet className="size-5" />}
          tone="success"
          trend={stats.totalRecebido > 0 ? `${brl(stats.totalRecebido)} recebidos` : "Nenhum registro"}
        />
        <StatCard
          label="Em aberto"
          value={brl(stats.totalAberto)}
          icon={<CalendarClock className="size-5" />}
          tone="warning"
          trend={stats.totalAberto > 0 ? `${brl(stats.totalAberto)} a receber` : "Nenhum registro"}
        />
        <StatCard
          label="Vencido"
          value={brl(stats.totalVencido)}
          icon={<Wallet className="size-5" />}
          tone="destructive"
          trend={stats.totalVencido > 0 ? `${brl(stats.totalVencido)} vencidos` : "Nenhum registro"}
        />
        <StatCard
          label="Alunos ativos"
          value={stats.alunosAtivos}
          icon={<Users className="size-5" />}
          tone="info"
          trend="Matriculados"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Inadimplentes"
          value={stats.alunosInadimplentes}
          icon={<UserX className="size-5" />}
          tone="destructive"
          trend="Com situação irregular"
        />
        <StatCard
          label="Adimplência"
          value={`${stats.taxaAdimplencia}%`}
          icon={<Percent className="size-5" />}
          tone={stats.taxaAdimplencia >= 70 ? "success" : stats.taxaAdimplencia >= 40 ? "warning" : "destructive"}
          trend={stats.taxaAdimplencia >= 70 ? "Boa" : stats.taxaAdimplencia >= 40 ? "Regular" : "Baixa"}
        />
        <StatCard
          label="Ticket médio"
          value={brl(stats.ticketMedio)}
          icon={<TrendingUp className="size-5" />}
          tone="default"
          trend="Valor médio por aluno ativo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Receita mensal" subtitle="Valores recebidos por mês" index={0}>
          <ResponsiveContainer width="100%" height={256}>
            <AreaChart data={chartData.receitaMensal}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" tick={axisStyle} stroke="var(--border)" />
              <YAxis tick={axisStyle} stroke="var(--border)" tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }}
                formatter={(v) => brl(Number(v))}
              />
              <Area type="monotone" dataKey="receita" stroke="var(--primary)" fill="url(#grad1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Receita anual" subtitle="Por ano" index={1}>
          <ResponsiveContainer width="100%" height={256}>
            <BarChart data={chartData.receitaAnual}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="ano" tick={axisStyle} stroke="var(--border)" />
              <YAxis tick={axisStyle} stroke="var(--border)" tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }}
                formatter={(v) => brl(Number(v))}
              />
              <Bar dataKey="receita" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Inadimplência por período" subtitle="Percentual do valor em atraso" index={2}>
          <ResponsiveContainer width="100%" height={256}>
            <LineChart data={chartData.inadimplencia}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" tick={axisStyle} stroke="var(--border)" />
              <YAxis tick={axisStyle} stroke="var(--border)" tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }}
                formatter={(v) => `${v}%`}
              />
              <Line type="monotone" dataKey="percentual" stroke="var(--destructive)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Evolução de pagamentos" subtitle="Pagos vs pendentes no mês" index={3}>
          <ResponsiveContainer width="100%" height={256}>
            <AreaChart data={pagamentosDiarios}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="dia" tick={axisStyle} stroke="var(--border)" />
              <YAxis tick={axisStyle} stroke="var(--border)" allowDecimals={false} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="pagos" stackId="1" stroke="var(--success)" fill="var(--success)" fillOpacity={0.3} strokeWidth={2} name="Pagos" />
              <Area type="monotone" dataKey="pendentes" stackId="1" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.3} strokeWidth={2} name="Pendentes" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}
