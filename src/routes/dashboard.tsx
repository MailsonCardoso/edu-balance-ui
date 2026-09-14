import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Wallet, CalendarClock, Users, UserX, TrendingUp, Percent, TrendingDown, Cake } from "lucide-react";
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
import {
  fetchDashboardFinanceiro,
  fetchDashboardMensalidades,
  type DashboardFinanceiro,
  type DashboardMensalidades,
} from "@/lib/api/dashboard-financeiro";
import { fetchTransactions } from "@/lib/api/transactions";
import type { Transaction } from "@/lib/api/transactions";

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

function parseDataNasc(data: string): Date | null {
  if (!data) return null;
  const [dia, mes, ano] = data.split("/").map(Number);
  if (!dia || !mes || !ano) return null;
  return new Date(ano, mes - 1, dia);
}

function idadeNoDia(nasc: Date, ref: Date = new Date()): number {
  let idade = ref.getFullYear() - nasc.getFullYear();
  if (ref.getMonth() < nasc.getMonth()) idade--;
  else if (ref.getMonth() === nasc.getMonth() && ref.getDate() < nasc.getDate()) idade--;
  return idade;
}

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardFinanceiro | null>(null);
  const [resumo, setResumo] = useState<DashboardMensalidades | null>(null);
  const [alunos, setAlunos] = useState<Awaited<ReturnType<typeof fetchAlunos>>>([]);
  const [transacoes, setTransacoes] = useState<Transaction[]>([]);

  useEffect(() => {
    const now = new Date();
    Promise.all([
      fetchAlunos(),
      fetchDashboardFinanceiro(),
      fetchDashboardMensalidades().catch(() => null),
      fetchTransactions(now.getMonth() + 1, now.getFullYear()).catch(() => ({
        transactions: [],
      })),
    ])
      .then(([a, d, r, t]) => {
        setAlunos(a);
        setDashboard(d);
        setResumo(r);
        setTransacoes(t.transactions);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const ativos = alunos.filter((a) => a.status === "ativo");
    const inadimplentes = alunos.filter((a) => a.situacao === "inadimplente" || a.situacao === "em_atraso");

    const ticketMedio = resumo?.ticket_medio ?? 0;

    const taxaAdimplencia = ativos.length > 0
      ? Math.round(((ativos.length - inadimplentes.length) / ativos.length) * 100)
      : 0;

    return {
      alunosAtivos: ativos.length,
      alunosInadimplentes: inadimplentes.length,
      ticketMedio,
      taxaAdimplencia,
    };
  }, [alunos, resumo]);

  const fluxo = useMemo(() => {
    const entradas = transacoes
      .filter((t) => t.type === "entrada")
      .reduce((s, t) => s + Number(t.amount), 0);
    const saidas = transacoes
      .filter((t) => t.type === "saida")
      .reduce((s, t) => s + Number(t.amount), 0);
    return { entradas, saidas, saldo: entradas - saidas };
  }, [transacoes]);

  const receitaAnual = useMemo(() => resumo?.receita_por_ano ?? [], [resumo]);

  const pagamentosDiarios = useMemo(() => resumo?.pagamentos_por_dia ?? [], [resumo]);

  const chartConsolidado = useMemo(() => {
    return (
      dashboard?.receitas_mensais.map((r) => ({
        mes: r.mes,
        receita: r.receita,
        despesa: r.despesa,
      })) ?? []
    );
  }, [dashboard]);

  const aniversariantes = useMemo(() => {
    const agora = new Date();
    return alunos
      .map((a) => {
        const nasc = parseDataNasc(a.dataNascimento);
        return nasc && nasc.getMonth() === agora.getMonth()
          ? {
              nome: a.nome,
              turma: a.turma,
              dia: nasc.getDate(),
              mes: nasc.toLocaleDateString("pt-BR", { month: "long" }),
              idade: idadeNoDia(nasc, agora),
              ehHoje: nasc.getDate() === agora.getDate() && nasc.getMonth() === agora.getMonth(),
            }
          : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => a.dia - b.dia);
  }, [alunos]);

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
          value={brl(fluxo.entradas)}
          icon={<Wallet className="size-5" />}
          tone="success"
          trend="Fluxo de Caixa"
        />
        <StatCard
          label="Despesas no mês"
          value={brl(fluxo.saidas)}
          icon={<TrendingDown className="size-5" />}
          tone="destructive"
          trend="Fluxo de Caixa"
        />
        <StatCard
          label="Saldo do mês"
          value={brl(fluxo.saldo)}
          icon={<Wallet className="size-5" />}
          tone={fluxo.saldo >= 0 ? "success" : "destructive"}
          trend={fluxo.saldo >= 0 ? "Positivo" : "Negativo"}
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
            <AreaChart data={chartConsolidado}>
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
            <BarChart data={receitaAnual}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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

        <div
          className="bg-card rounded-xl border border-border p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 animate-in"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">Aniversariantes do mês</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date().toLocaleDateString("pt-BR", { month: "long" })} ·{" "}
                {aniversariantes.length}{" "}
                {aniversariantes.length === 1 ? "aluno" : "alunos"}
              </p>
            </div>
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Cake className="size-5" />
            </div>
          </div>
          {aniversariantes.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <Cake className="mb-3 size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Nenhum aniversariante este mês</p>
            </div>
          ) : (
            <ul className="h-64 divide-y divide-border overflow-y-auto pr-1">
              {aniversariantes.map((b) => (
                <li key={`${b.nome}-${b.dia}`} className="py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {b.dia}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 truncate text-sm font-medium">
                        {b.nome}
                        {b.ehHoje && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            É hoje!
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {b.dia} de {b.mes} · Completa {b.idade} anos · {b.turma}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
