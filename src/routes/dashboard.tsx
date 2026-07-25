import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Wallet, CalendarClock, Users, UserX, TrendingUp, Percent, TrendingDown } from "lucide-react";
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
import { brl } from "@/lib/format";
import { fetchAlunos } from "@/lib/api/alunos";
import { fetchMensalidades } from "@/lib/api/mensalidades";
import { fetchDashboardFinanceiro, type DashboardFinanceiro } from "@/lib/api/dashboard-financeiro";
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
  const [dashboard, setDashboard] = useState<DashboardFinanceiro | null>(null);
  const [alunos, setAlunos] = useState<Awaited<ReturnType<typeof fetchAlunos>>>([]);
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);

  useEffect(() => {
    Promise.all([fetchAlunos(), fetchMensalidades(), fetchDashboardFinanceiro()])
      .then(([a, m, d]) => { setAlunos(a); setMensalidades(m); setDashboard(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const ativos = alunos.filter((a) => a.status === "ativo");
    const inadimplentes = alunos.filter((a) => a.situacao === "inadimplente");

    const ticketMedio = ativos.length > 0
      ? mensalidades.filter((m) => m.status !== "pago").reduce((s, m) => s + m.valor, 0) / ativos.length
      : 0;

    const taxaAdimplencia = ativos.length > 0
      ? Math.round(((ativos.length - inadimplentes.length) / ativos.length) * 100)
      : 0;

    return {
      alunosAtivos: ativos.length,
      alunosInadimplentes: inadimplentes.length,
      ticketMedio,
      taxaAdimplencia,
    };
  }, [alunos, mensalidades]);

  const chartData = useMemo(() => {
    const meses: Record<string, number> = {};
    const anos: Record<string, number> = {};

    for (const m of mensalidades) {
      if (m.status === "pago" && m.dataPagamento) {
        const d = parseDataBr(m.dataPagamento);
        const label = mesAno(d);
        meses[label] = (meses[label] || 0) + m.valor;
        const anoLabel = String(d.getFullYear());
        anos[anoLabel] = (anos[anoLabel] || 0) + m.valor;
      }
    }

    const receitaMensal = Object.entries(meses)
      .map(([mes, receita]) => ({ mes, receita }))
      .sort((a, b) => a.mes.localeCompare(b.mes));

    const receitaAnual = Object.entries(anos)
      .map(([ano, receita]) => ({ ano, receita }))
      .sort((a, b) => a.ano.localeCompare(b.ano));

    return { receitaMensal, receitaAnual };
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

  const chartConsolidado = useMemo(() => {
    return (
      dashboard?.receitas_mensais.map((r) => ({
        mes: r.mes,
        receita: r.receita,
        despesa: r.despesa,
      })) ?? []
    );
  }, [dashboard]);

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
          value={brl(dashboard?.receita_mes ?? 0)}
          icon={<Wallet className="size-5" />}
          tone="success"
          trend="Mensalidades + Receitas"
        />
        <StatCard
          label="Despesas no mês"
          value={brl(dashboard?.despesa_mes ?? 0)}
          icon={<TrendingDown className="size-5" />}
          tone="destructive"
          trend="Contas pagas"
        />
        <StatCard
          label="Saldo do mês"
          value={brl(dashboard?.saldo_mes ?? 0)}
          icon={<Wallet className="size-5" />}
          tone={((dashboard?.saldo_mes ?? 0) >= 0) ? "success" : "destructive"}
          trend={((dashboard?.saldo_mes ?? 0) >= 0) ? "Positivo" : "Negativo"}
        />
        <StatCard
          label="Alunos ativos"
          value={stats.alunosAtivos}
          icon={<Users className="size-5" />}
          tone="info"
          trend="Matriculados"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="A receber"
          value={brl(dashboard?.receita_prevista ?? 0)}
          icon={<CalendarClock className="size-5" />}
          tone="warning"
          trend="Mensalidades + Receitas pendentes"
        />
        <StatCard
          label="A pagar"
          value={brl(dashboard?.despesa_pendente ?? 0)}
          icon={<CalendarClock className="size-5" />}
          tone="warning"
          trend="Despesas pendentes"
        />
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Receita vs Despesa" subtitle="Últimos 6 meses" index={0}>
          <ResponsiveContainer width="100%" height={256}>
            <AreaChart data={chartConsolidado.length > 0 ? chartConsolidado : chartData.receitaMensal}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--destructive)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" tick={axisStyle} stroke="var(--border)" />
              <YAxis tick={axisStyle} stroke="var(--border)" tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }}
                formatter={(v) => brl(Number(v))}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="receita" stroke="var(--primary)" fill="url(#grad1)" strokeWidth={2} name="Receita" />
              <Area type="monotone" dataKey="despesa" stroke="var(--destructive)" fill="url(#grad2)" strokeWidth={2} name="Despesa" />
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
        <ChartCard title="Ticket médio" subtitle="Valor médio por aluno ativo" index={2}>
          <StatCard
            label="Ticket médio"
            value={brl(stats.ticketMedio)}
            icon={<TrendingUp className="size-5" />}
            tone="default"
            trend="Valor médio por aluno ativo"
          />
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
