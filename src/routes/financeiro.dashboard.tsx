import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2, Wallet, TrendingUp, TrendingDown, DollarSign,
  CalendarClock, AlertTriangle, Users, Percent, BarChart3,
  PiggyBank, Receipt, CreditCard, UserCheck, Target,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, AreaChart, Area,
} from "recharts";
import { PageHeader, StatCard } from "@/components/shared/Primitives";
import { brl } from "@/lib/format";
import { fetchDashboardFinanceiro } from "@/lib/api/dashboard-financeiro";
import type { DashboardData } from "@/lib/financeiro-types";

export const Route = createFileRoute("/financeiro/dashboard")({
  component: DashboardFinanceiro,
});

const axisStyle = { fontSize: 12, fill: "var(--muted-foreground)" };

const PERIODOS = [
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
  { value: "year", label: "Ano atual" },
  { value: "custom", label: "Personalizado" },
];

function ChartCard({ title, subtitle, children, index = 0 }: { title: string; subtitle?: string; children: React.ReactNode; index?: number }) {
  return (
    <div
      className="bg-card rounded-xl border border-border p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 animate-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="mb-4">
        <h3 className="font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="h-72">{children}</div>
    </div>
  );
}

function DashboardFinanceiro() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [periodo, setPeriodo] = useState("30");

  useEffect(() => {
    fetchDashboardFinanceiro()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16"];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard Financeiro"
        description="Indicadores em tempo real da instituição"
      />

      {/* Filtros de período */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto">
        {PERIODOS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriodo(p.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
              periodo === p.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Linha 1: Cards principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Saldo Atual" value={brl(data.saldo_atual)} icon={<Wallet className="size-5" />} tone={data.saldo_atual >= 0 ? "success" : "destructive"} />
        <StatCard label="Entradas do Mês" value={brl(data.entradas_mes)} icon={<TrendingUp className="size-5" />} tone="success" />
        <StatCard label="Saídas do Mês" value={brl(data.saidas_mes)} icon={<TrendingDown className="size-5" />} tone="destructive" />
        <StatCard label="Saldo do Mês" value={brl(data.saldo_mes)} icon={<DollarSign className="size-5" />} tone={data.saldo_mes >= 0 ? "success" : "destructive"} />
      </div>

      {/* Linha 2: Receitas e Mensalidades */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Receita Prevista" value={brl(data.receita_prevista)} icon={<Target className="size-5" />} tone="info" />
        <StatCard label="Receita Recebida" value={brl(data.receita_recebida)} icon={<Receipt className="size-5" />} tone="success" />
        <StatCard label="Mensalidades em Aberto" value={brl(data.mensalidades_aberto)} icon={<CalendarClock className="size-5" />} tone="warning" />
        <StatCard label="Mensalidades Vencidas" value={brl(data.mensalidades_vencidas)} icon={<AlertTriangle className="size-5" />} tone="destructive" />
      </div>

      {/* Linha 3: Contas e Alunos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <StatCard label="Contas a Pagar" value={brl(data.contas_pagar)} icon={<CreditCard className="size-5" />} tone="warning" />
        <StatCard label="Contas Vencidas" value={brl(data.contas_vencidas)} icon={<AlertTriangle className="size-5" />} tone="destructive" />
        <StatCard label="Contas Pagas" value={brl(data.contas_pagas)} icon={<PiggyBank className="size-5" />} tone="success" />
        <StatCard label="Alunos Ativos" value={data.total_alunos_ativos} icon={<Users className="size-5" />} tone="info" />
        <StatCard label="Receita Média/Aluno" value={brl(data.receita_media_aluno)} icon={<UserCheck className="size-5" />} tone="default" />
      </div>

      {/* Linha 4: Indicador de inadimplência */}
      <div className="mb-6">
        <StatCard
          label="Inadimplência"
          value={`${data.perc_inadimplencia}%`}
          icon={<Percent className="size-5" />}
          tone={data.perc_inadimplencia <= 10 ? "success" : data.perc_inadimplencia <= 25 ? "warning" : "destructive"}
          trend={
            data.perc_inadimplencia <= 10
              ? "Taxa saudável"
              : data.perc_inadimplencia <= 25
                ? "Atenção necessária"
                : "Crítico"
          }
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Pizza - Receitas por categoria */}
        <ChartCard title="Receitas por Categoria" subtitle="Distribuição das receitas do período">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data.receitas_por_categoria}
                dataKey="valor"
                nameKey="nome"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                label
              >
                {data.receitas_por_categoria.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => brl(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Pizza - Despesas por categoria */}
        <ChartCard title="Despesas por Categoria" subtitle="Distribuição das despesas do período">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data.despesas_por_categoria}
                dataKey="valor"
                nameKey="nome"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                label
              >
                {data.despesas_por_categoria.map((_, i) => (
                  <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => brl(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Barras - Receitas mensais */}
        <ChartCard title="Receitas por Mês" subtitle="Evolução das receitas nos últimos 6 meses">
          <ResponsiveContainer>
            <BarChart data={data.receitas_mensais}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" tick={axisStyle} stroke="var(--border)" />
              <YAxis tick={axisStyle} stroke="var(--border)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} formatter={(v) => brl(Number(v))} />
              <Bar dataKey="receita" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Barras - Despesas mensais */}
        <ChartCard title="Despesas por Mês" subtitle="Evolução das despesas nos últimos 6 meses">
          <ResponsiveContainer>
            <BarChart data={data.despesas_mensais}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" tick={axisStyle} stroke="var(--border)" />
              <YAxis tick={axisStyle} stroke="var(--border)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} formatter={(v) => brl(Number(v))} />
              <Bar dataKey="despesa" fill="var(--destructive)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Linha - Evolução do saldo */}
        <ChartCard title="Evolução do Saldo" subtitle="Saldo acumulado ao longo do tempo">
          <ResponsiveContainer>
            <AreaChart data={data.evolucao_saldo}>
              <defs>
                <linearGradient id="saldoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" tick={axisStyle} stroke="var(--border)" />
              <YAxis tick={axisStyle} stroke="var(--border)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} formatter={(v) => brl(Number(v))} />
              <Area type="monotone" dataKey="saldo" stroke="var(--primary)" fill="url(#saldoGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Barras - Entradas x Saídas */}
        <ChartCard title="Entradas x Saídas" subtitle="Comparativo mensal">
          <ResponsiveContainer>
            <BarChart data={data.entradas_x_saidas}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" tick={axisStyle} stroke="var(--border)" />
              <YAxis tick={axisStyle} stroke="var(--border)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} formatter={(v) => brl(Number(v))} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="entradas" fill="var(--success)" radius={[6, 6, 0, 0]} name="Entradas" />
              <Bar dataKey="saidas" fill="var(--destructive)" radius={[6, 6, 0, 0]} name="Saídas" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Comparativo mês atual x anterior */}
        <ChartCard title="Comparativo Mensal" subtitle={`${data.comparativo_mensal.mes_atual} x ${data.comparativo_mensal.mes_anterior}`}>
          <ResponsiveContainer>
            <BarChart
              data={[
                { nome: "Entradas", atual: data.comparativo_mensal.entradas_atual, anterior: data.comparativo_mensal.entradas_anterior },
                { nome: "Saídas", atual: data.comparativo_mensal.saidas_atual, anterior: data.comparativo_mensal.saidas_anterior },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="nome" tick={axisStyle} stroke="var(--border)" />
              <YAxis tick={axisStyle} stroke="var(--border)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} formatter={(v) => brl(Number(v))} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="atual" fill="var(--chart-1)" radius={[6, 6, 0, 0]} name={data.comparativo_mensal.mes_atual} />
              <Bar dataKey="anterior" fill="var(--chart-2)" radius={[6, 6, 0, 0]} name={data.comparativo_mensal.mes_anterior} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Crescimento financeiro */}
        <ChartCard title="Crescimento Financeiro" subtitle="Variação percentual">
          <ResponsiveContainer>
            <LineChart data={data.evolucao_saldo}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" tick={axisStyle} stroke="var(--border)" />
              <YAxis tick={axisStyle} stroke="var(--border)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} formatter={(v) => brl(Number(v))} />
              <Line type="monotone" dataKey="saldo" stroke="var(--chart-3)" strokeWidth={2} dot={{ r: 4 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}
