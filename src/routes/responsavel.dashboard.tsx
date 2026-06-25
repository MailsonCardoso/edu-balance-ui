import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  LogOut,
  User,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  ArrowUpRight,
  Building2,
  Shield,
  Smartphone,
  Banknote,
  HandCoins,
  type LucideIcon,
} from "lucide-react";
import { brl } from "@/lib/format";

interface MensalidadeData {
  id: string;
  mes_referencia: string;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: string;
  forma_pagamento: string | null;
  origem: string | null;
}

interface AlunoData {
  id: string;
  nome: string;
  sexo: string;
  turma: string;
  status: string;
  situacao: string;
  mensalidades: MensalidadeData[];
}

interface ResponsavelData {
  nome: string;
  email: string;
}

interface PortalData {
  responsavel: ResponsavelData;
  alunos: AlunoData[];
}

export const Route = createFileRoute("/responsavel/dashboard")({
  component: Dashboard,
});

const origemConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  mercadopago: { label: "Mercado Pago", color: "text-sky-700 bg-sky-50 ring-1 ring-sky-200", icon: ArrowUpRight },
  caixa: { label: "Caixa Econômica", color: "text-blue-700 bg-blue-50 ring-1 ring-blue-200", icon: Building2 },
  admin: { label: "Admin", color: "text-gray-700 bg-gray-100 ring-1 ring-gray-200", icon: Shield },
  pix_manual: { label: "PIX", color: "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200", icon: Smartphone },
  dinheiro: { label: "Dinheiro", color: "text-amber-700 bg-amber-50 ring-1 ring-amber-200", icon: Banknote },
  transferencia: { label: "Transferência", color: "text-purple-700 bg-purple-50 ring-1 ring-purple-200", icon: HandCoins },
};

const statusConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  pago: { label: "Pago", color: "text-emerald-600 bg-emerald-50 ring-1 ring-emerald-200", icon: CheckCircle2 },
  pendente: { label: "Pendente", color: "text-amber-600 bg-amber-50 ring-1 ring-amber-200", icon: Clock },
  atrasado: { label: "Atrasado", color: "text-red-600 bg-red-50 ring-1 ring-red-200", icon: AlertTriangle },
};

const situacaoConfig: Record<string, { label: string; color: string }> = {
  em_dia: { label: "Em dia", color: "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200" },
  em_atraso: { label: "Em atraso", color: "text-amber-700 bg-amber-50 ring-1 ring-amber-200" },
  inadimplente: { label: "Inadimplente", color: "text-red-700 bg-red-50 ring-1 ring-red-200" },
};

function formatDate(dateStr: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const [d] = dateStr.split(" ");
    const partes = d.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dateStr;
}

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<PortalData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("responsavel_data");
    if (!stored) {
      navigate({ to: "/responsavel", replace: true });
      return;
    }
    setData(JSON.parse(stored));
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("responsavel_data");
    navigate({ to: "/responsavel" });
  };

  const stats = useMemo(() => {
    if (!data) return null;
    const todasMensalidades = data.alunos.flatMap((a) => a.mensalidades);
    const pendentes = todasMensalidades.filter((m) => m.status === "pendente");
    const vencidas = todasMensalidades.filter((m) => m.status === "atrasado");
    const pagas = todasMensalidades.filter((m) => m.status === "pago");
    const totalDevido = [...pendentes, ...vencidas].reduce((s, m) => s + m.valor, 0);
    const totalPago = pagas.reduce((s, m) => s + m.valor, 0);
    const adimplencia = todasMensalidades.length > 0
      ? Math.round((pagas.length / todasMensalidades.length) * 100)
      : 0;
    const alunosInadimplentes = data.alunos.filter(
      (a) => a.situacao === "em_atraso" || a.situacao === "inadimplente"
    ).length;
    return { pendentes, vencidas, pagas, totalDevido, totalPago, adimplencia, alunosInadimplentes };
  }, [data]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="size-8 animate-spin text-[#D62828]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-full bg-white/20 grid place-items-center backdrop-blur-sm ring-2 ring-white/30">
                <GraduationCap className="size-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Portal do Responsável</h1>
                <p className="text-sm text-white/70">Associação Bombeiro Paranã</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm text-white/80"
            >
              <LogOut className="size-4" />
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Olá, {data.responsavel.nome.split(" ")[0]}!
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Acompanhe abaixo as mensalidades dos alunos vinculados ao seu CPF.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
              <Mail className="size-4" />
              {data.responsavel.email}
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Mensalidades</p>
                <div className="size-9 rounded-lg bg-blue-50 grid place-items-center">
                  <CreditCard className="size-4 text-blue-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pendentes.length + stats.vencidas.length + stats.pagas.length}
              </p>
              <p className="text-xs text-gray-400 mt-1">Total registradas</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Em aberto</p>
                <div className="size-9 rounded-lg bg-amber-50 grid place-items-center">
                  <Clock className="size-4 text-amber-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pendentes.length + stats.vencidas.length}
              </p>
              <p className="text-xs text-amber-600 mt-1">{brl(stats.totalDevido)} devido</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Pagas</p>
                <div className="size-9 rounded-lg bg-emerald-50 grid place-items-center">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.pagas.length}</p>
              <p className="text-xs text-emerald-600 mt-1">{brl(stats.totalPago)} quitado</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Adimplência</p>
                <div className="size-9 rounded-lg bg-purple-50 grid place-items-center">
                  <TrendingUp className="size-4 text-purple-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.adimplencia}%</p>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${stats.adimplencia}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {data.alunos.map((aluno) => {
          const pendentes = aluno.mensalidades.filter((m) => m.status === "pendente" || m.status === "atrasado");
          const totalDevido = pendentes.reduce((s, m) => s + m.valor, 0);
          const sit = situacaoConfig[aluno.situacao] || situacaoConfig.em_dia;

          return (
            <div key={aluno.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-emerald-50/80 via-transparent to-transparent px-6 py-5 border-b border-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`size-12 rounded-xl grid place-items-center ${
                      aluno.situacao === "em_dia" ? "bg-emerald-50" : "bg-red-50"
                    }`}>
                      <User className={`size-6 ${
                        aluno.situacao === "em_dia" ? "text-emerald-500" : "text-red-500"
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{aluno.nome}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{aluno.turma}</span>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400 capitalize">{aluno.sexo === "feminino" ? "Aluna" : "Aluno"}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${sit.color}`}>
                    {sit.label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-px bg-gray-50">
                <div className="bg-white p-5 text-center">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Mensalidades</p>
                  <p className="text-xl font-bold text-gray-900">{aluno.mensalidades.length}</p>
                </div>
                <div className="bg-white p-5 text-center">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Em aberto</p>
                  <p className={`text-xl font-bold ${pendentes.length > 0 ? "text-amber-500" : "text-emerald-500"}`}>
                    {pendentes.length}
                  </p>
                </div>
                <div className="bg-white p-5 text-center">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Valor devido</p>
                  <p className={`text-xl font-bold ${totalDevido > 0 ? "text-red-500" : "text-emerald-500"}`}>
                    {totalDevido > 0 ? brl(totalDevido) : "—"}
                  </p>
                </div>
              </div>

              {aluno.mensalidades.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <CreditCard className="size-10 mb-3 opacity-30" />
                  <p className="text-sm font-medium">Nenhuma mensalidade cadastrada</p>
                  <p className="text-xs text-gray-300 mt-1">As mensalidades aparecerão aqui quando forem criadas</p>
                </div>
              ) : (
                <div>
                  <div className="px-6 py-3 border-b border-gray-50 bg-gray-50/30">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Mensalidades
                    </p>
                  </div>
                  {aluno.mensalidades.map((m, idx) => {
                    const StatusIcon = statusConfig[m.status]?.icon || Clock;
                    const origem = m.origem && origemConfig[m.origem] ? origemConfig[m.origem] : null;
                    const OrigemIcon = origem?.icon || Shield;
                    return (
                      <div
                        key={m.id}
                        className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors ${
                          idx < aluno.mensalidades.length - 1 ? "border-b border-gray-50" : ""
                        }`}
                      >
                        <div className={`size-10 rounded-lg grid place-items-center flex-shrink-0 ${
                          m.status === "pago" ? "bg-emerald-50" : m.status === "atrasado" ? "bg-red-50" : "bg-amber-50"
                        }`}>
                          <StatusIcon className={`size-5 ${
                            m.status === "pago" ? "text-emerald-500" : m.status === "atrasado" ? "text-red-500" : "text-amber-500"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{m.mes_referencia}</p>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusConfig[m.status]?.color}`}>
                                  <StatusIcon className="size-3" />
                                  {statusConfig[m.status]?.label}
                                </span>
                                {origem && (
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${origem.color}`}>
                                    <OrigemIcon className="size-3" />
                                    {origem.label}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className={`text-sm font-bold ${
                                m.status === "pago" ? "text-emerald-600" : m.status === "atrasado" ? "text-red-600" : "text-amber-600"
                              }`}>
                                {brl(m.valor)}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Vence {formatDate(m.data_vencimento)}
                              </p>
                              {m.data_pagamento && (
                                <p className="text-xs text-emerald-500 font-medium">
                                  Pago em {formatDate(m.data_pagamento)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {data.alunos.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center text-gray-400">
            <User className="size-12 mb-4 opacity-30" />
            <p className="text-sm font-medium text-gray-500">Nenhum aluno vinculado</p>
            <p className="text-xs text-gray-300 mt-1">Entre em contato com a escola para vincular seus dependentes</p>
          </div>
        )}
      </div>
    </div>
  );
}
