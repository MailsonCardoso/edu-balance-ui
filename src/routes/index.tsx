import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Wallet, CalendarClock, Users, UserX } from "lucide-react";
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

const vazioGrafico: { mes: string; receita: number }[] = [];
const vazioAnual: { ano: string; receita: number }[] = [];
const vazioInadimplencia: { mes: string; percentual: number }[] = [];
const vazioPagamentos: { dia: string; pagos: number; pendentes: number }[] = [];

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
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalRecebido: 0,
    totalAberto: 0,
    totalVencido: 0,
    alunosAtivos: 0,
    alunosInadimplentes: 0,
  });

  useEffect(() => {
    Promise.all([fetchAlunos(), fetchMensalidades()])
      .then(([alunos, mensalidades]) => {
        const ativos = alunos.filter((a) => a.status === "ativo");
        const inadimplentes = alunos.filter((a) => a.situacao === "inadimplente");

        const recebido = mensalidades
          .filter((m) => m.status === "pago")
          .reduce((s, m) => s + m.valor, 0);

        const aberto = mensalidades
          .filter((m) => m.status === "pendente")
          .reduce((s, m) => s + m.valor, 0);

        const vencido = mensalidades
          .filter((m) => m.status === "atrasado")
          .reduce((s, m) => s + m.valor, 0);

        setStats({ totalRecebido: recebido, totalAberto: aberto, totalVencido: vencido, alunosAtivos: ativos.length, alunosInadimplentes: inadimplentes.length });
      })
      .catch(() => setStats({ totalRecebido: 0, totalAberto: 0, totalVencido: 0, alunosAtivos: 0, alunosInadimplentes: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const trendRecebido = stats.totalRecebido > 0 ? `R$ ${stats.totalRecebido.toFixed(2)} recebidos` : "Nenhum registro";
  const trendAberto = stats.totalAberto > 0 ? `R$ ${stats.totalAberto.toFixed(2)} a receber` : "Nenhum registro";
  const trendVencido = stats.totalVencido > 0 ? `R$ ${stats.totalVencido.toFixed(2)} vencidos` : "Nenhum registro";

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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Recebido no mês"
          value={brl(stats.totalRecebido)}
          icon={<Wallet className="size-5" />}
          tone="success"
          trend={trendRecebido}
        />
        <StatCard
          label="Em aberto"
          value={brl(stats.totalAberto)}
          icon={<CalendarClock className="size-5" />}
          tone="warning"
          trend={trendAberto}
        />
        <StatCard
          label="Vencido"
          value={brl(stats.totalVencido)}
          icon={<Wallet className="size-5" />}
          tone="destructive"
          trend={trendVencido}
        />
        <StatCard
          label="Alunos ativos"
          value={stats.alunosAtivos}
          icon={<Users className="size-5" />}
          tone="info"
          trend="Matriculados"
        />
        <StatCard
          label="Inadimplentes"
          value={stats.alunosInadimplentes}
          icon={<UserX className="size-5" />}
          tone="destructive"
          trend="Com situação irregular"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Receita mensal" subtitle="Comparativo com a meta" index={0}>
          <ResponsiveContainer>
            <AreaChart data={vazioGrafico}>
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

        <ChartCard title="Receita anual" subtitle="Evolução" index={1}>
          <ResponsiveContainer>
            <BarChart data={vazioAnual}>
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
        <ChartCard title="Inadimplência por período" subtitle="Percentual mensal" index={2}>
          <ResponsiveContainer>
            <LineChart data={vazioInadimplencia}>
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
          <ResponsiveContainer>
            <AreaChart data={vazioPagamentos}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="dia" tick={axisStyle} stroke="var(--border)" />
              <YAxis tick={axisStyle} stroke="var(--border)" />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="pagos" stackId="1" stroke="var(--success)" fill="var(--success)" fillOpacity={0.3} strokeWidth={2} />
              <Area type="monotone" dataKey="pendentes" stackId="1" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.3} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}
