import { createFileRoute } from "@tanstack/react-router";
import { Wallet, AlertCircle, CalendarClock, Users, UserX } from "lucide-react";
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
import {
  dashboardStats,
  receitaMensal,
  receitaAnual,
  inadimplenciaPeriodo,
  evolucaoPagamentos,
} from "@/lib/mock-data";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/")({
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
      <div className="h-64">{children}</div>
    </div>
  );
}

const axisStyle = { fontSize: 12, fill: "var(--muted-foreground)" };

function Dashboard() {
  return (
    <>
      <PageHeader title="Dashboard" description="Visão geral das finanças da escola" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Recebido no mês"
          value={brl(dashboardStats.totalRecebido)}
          icon={<Wallet className="size-5" />}
          tone="success"
          trend="+12% vs mês anterior"
        />
        <StatCard
          label="Em aberto"
          value={brl(dashboardStats.totalAberto)}
          icon={<CalendarClock className="size-5" />}
          tone="warning"
          trend="A receber neste mês"
        />
        <StatCard
          label="Vencido"
          value={brl(dashboardStats.totalVencido)}
          icon={<AlertCircle className="size-5" />}
          tone="destructive"
          trend="23 parcelas em atraso"
        />
        <StatCard
          label="Alunos ativos"
          value={dashboardStats.alunosAtivos}
          icon={<Users className="size-5" />}
          tone="info"
          trend="Matriculados"
        />
        <StatCard
          label="Inadimplentes"
          value={dashboardStats.alunosInadimplentes}
          icon={<UserX className="size-5" />}
          tone="destructive"
          trend="12% da base"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Receita mensal" subtitle="Comparativo com a meta" index={0}>
          <ResponsiveContainer>
            <AreaChart data={receitaMensal}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" tick={axisStyle} stroke="var(--border)" />
              <YAxis
                tick={axisStyle}
                stroke="var(--border)"
                tickFormatter={(v) => `${v / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
                formatter={(v) => brl(Number(v))}
              />
              <Area
                type="monotone"
                dataKey="receita"
                stroke="var(--primary)"
                fill="url(#grad1)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="meta"
                stroke="var(--chart-3)"
                strokeDasharray="4 4"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Receita anual" subtitle="Evolução nos últimos anos" index={1}>
          <ResponsiveContainer>
            <BarChart data={receitaAnual}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="ano" tick={axisStyle} stroke="var(--border)" />
              <YAxis
                tick={axisStyle}
                stroke="var(--border)"
                tickFormatter={(v) => `${v / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
                formatter={(v) => brl(Number(v))}
              />
              <Bar dataKey="receita" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Inadimplência por período" subtitle="Percentual mensal" index={2}>
          <ResponsiveContainer>
            <LineChart data={inadimplenciaPeriodo}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" tick={axisStyle} stroke="var(--border)" />
              <YAxis tick={axisStyle} stroke="var(--border)" tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
                formatter={(v) => `${v}%`}
              />
              <Line
                type="monotone"
                dataKey="percentual"
                stroke="var(--destructive)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Evolução de pagamentos" subtitle="Pagos vs pendentes no mês" index={3}>
          <ResponsiveContainer>
            <AreaChart data={evolucaoPagamentos}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="dia" tick={axisStyle} stroke="var(--border)" />
              <YAxis tick={axisStyle} stroke="var(--border)" />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="pagos"
                stackId="1"
                stroke="var(--success)"
                fill="var(--success)"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="pendentes"
                stackId="1"
                stroke="var(--chart-3)"
                fill="var(--chart-3)"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}
