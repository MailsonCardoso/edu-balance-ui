import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  User,
  CreditCard,
  History,
  Settings,
  Gift,
  Users,
  Shield,
  LogOut,
  Loader2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Banknote,
  Building2,
  HandCoins,
  Smartphone,
  Calendar,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  TrendingUp,
  Receipt,
  AlertTriangle,
  CheckCheck,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { brl, maskCPF, maskPhone } from "@/lib/format";
import {
  getAssociado,
  updateAssociado,
  type AssociadoData,
} from "@/lib/api/associado";
import {
  fetchAssociadoMensalidades,
  gerarCobrancaMensalidade,
  consultarStatusPagamento,
} from "@/lib/api/associado-mensalidades";
import type { Mensalidade, OrigemPagamento } from "@/lib/mock-data";

export const Route = createFileRoute("/associado/painel")({
  component: PainelAssociado,
});

const menuItems = [
  { id: "painel", label: "Painel do Sócio", icon: User },
  { id: "pagamentos", label: "PIX e Boletos", icon: CreditCard },
  { id: "historico", label: "Histórico", icon: History },
  { id: "dados", label: "Dados cadastrais", icon: Settings },
  { id: "beneficios", label: "Benefícios", icon: Gift },
  { id: "comunidade", label: "Comunidade", icon: Users },
];

function PainelAssociado() {
  const navigate = useNavigate();
  const [associado, setAssociado] = useState<AssociadoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("painel");

  useEffect(() => {
    const stored = localStorage.getItem("associado_data");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!parsed.alunos) parsed.alunos = [];
      setAssociado(parsed);
      setLoading(false);
    }

    const token = localStorage.getItem("associado_token");
    if (!token) {
      if (!stored) {
        navigate({ to: "/associado", replace: true });
      }
      return;
    }

    getAssociado()
      .then((res) => {
        if (res.success && res.associado) {
          const data = res.associado;
          if (!data.alunos) data.alunos = [];
          setAssociado(data);
          localStorage.setItem("associado_data", JSON.stringify(data));
        }
      })
      .catch(() => {
        localStorage.removeItem("associado_token");
        localStorage.removeItem("associado_data");
        navigate({ to: "/associado", replace: true });
      })
      .finally(() => {
        if (!stored) setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("associado_token");
    localStorage.removeItem("associado_data");
    toast.success("Sessão encerrada.");
    navigate({ to: "/associado", replace: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="size-8 animate-spin text-[#D62828]" />
      </div>
    );
  }

  if (!associado) return null;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-gradient-to-br from-[#D62828] to-[#B01E1E] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full bg-white/20 grid place-items-center backdrop-blur-sm ring-2 ring-white/30">
              <span className="text-xl font-bold text-white">
                {associado?.nome?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Olá, {associado.nome.split(" ")[0]}!</h1>
              <p className="text-sm text-white/70">Bem-vindo ao seu painel de associado</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm text-white/80"
            >
              <LogOut className="size-4" />
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 -mt-4">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = tab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                      isActive
                        ? "bg-gradient-to-r from-[#D62828]/10 to-transparent text-[#D62828] shadow-sm"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`size-8 rounded-lg grid place-items-center transition-colors ${
                      isActive ? "bg-[#D62828] text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      <Icon className="size-4" />
                    </div>
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="size-4 text-[#D62828]" />}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="lg:col-span-3">
            {tab === "painel" && <PainelTab associado={associado} />}
            {tab === "pagamentos" && <PagamentosTab />}
            {tab === "historico" && <HistoricoTab />}
            {tab === "dados" && <DadosTab associado={associado} />}
            {tab === "beneficios" && <BeneficiosTab />}
            {tab === "comunidade" && <ComunidadeTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

function PainelTab({ associado }: { associado: AssociadoData }) {
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagandoId, setPagandoId] = useState<string | null>(null);
  const [pixModal, setPixModal] = useState<{ qrCode?: string; qrCodeBase64?: string; mensalidadeId: string; status: 'waiting' | 'confirmed' } | null>(null);

  const handlePagar = async (m: Mensalidade) => {
    if (pagandoId) return;
    setPagandoId(m.id);
    try {
      const result = await gerarCobrancaMensalidade(m.id);
      if (result.success && result.data?.pix_qr_code_base64) {
        setPixModal({
          qrCode: result.data.pix_qr_code,
          qrCodeBase64: result.data.pix_qr_code_base64,
          mensalidadeId: m.id,
          status: 'waiting',
        });
      } else if (result.success && result.data?.payment_url) {
        window.location.href = result.data.payment_url;
      } else {
        toast.error(result.message || "Erro ao gerar cobrança");
      }
    } catch {
      toast.error("Erro ao conectar com Mercado Pago");
    } finally {
      setPagandoId(null);
    }
  };

  const fecharPix = () => {
    setPixModal(null);
    fetchAssociadoMensalidades().then(setMensalidades).catch(() => {});
  };

  useEffect(() => {
    if (!pixModal || pixModal.status === 'confirmed') return;
    const id = setInterval(async () => {
      try {
        const res = await consultarStatusPagamento(pixModal.mensalidadeId);
        if (res.data?.status === "pago") {
          setPixModal((prev) => prev ? { ...prev, status: 'confirmed' } : null);
          setTimeout(fecharPix, 2000);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(id);
  }, [pixModal]);

  useEffect(() => {
    fetchAssociadoMensalidades()
      .then(setMensalidades)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const pendentes = mensalidades.filter((m) => m.status === "pendente");
    const vencidas = mensalidades.filter((m) => m.status === "atrasado");
    const pagas = mensalidades.filter((m) => m.status === "pago");
    const totalValor = mensalidades.reduce((a, m) => a + m.valor, 0);
    const pagoValor = pagas.reduce((a, m) => a + m.valor, 0);
    const adimplencia = totalValor > 0 ? Math.round((pagoValor / totalValor) * 100) : 0;
    return { pendentes, vencidas, pagas, totalValor, pagoValor, adimplencia };
  }, [mensalidades]);

  const mensalidadesPorAluno = useMemo(() => {
    const grupos: Record<string, Mensalidade[]> = {};
    for (const m of mensalidades) {
      const nome = m.alunoNome || "Sem nome";
      if (!grupos[nome]) grupos[nome] = [];
      grupos[nome].push(m);
    }
    return grupos;
  }, [mensalidades]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#D62828]/5 via-transparent to-transparent p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Informações do Sócio</h2>
              <p className="text-sm text-gray-500 mt-1">Dados da sua associação</p>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              associado.status === "ativo"
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : "bg-gray-100 text-gray-600 ring-1 ring-gray-200"
            }`}>
              {associado.status === "ativo" ? "Ativo" : associado.status}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {[
              { icon: User, label: "Nome", value: associado.nome },
              { icon: Mail, label: "E-mail", value: associado.email },
              { icon: Phone, label: "Telefone", value: associado.telefone },
              { icon: Calendar, label: "Sócio desde", value: associado.created_at },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-50">
                <div className="flex items-center gap-2 text-gray-400 mb-1.5">
                  <item.icon className="size-3.5" />
                  <span className="text-xs">{item.label}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Pago</p>
            <div className="size-9 rounded-lg bg-emerald-50 grid place-items-center">
              <CheckCheck className="size-4 text-emerald-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{brl(stats.pagoValor)}</p>
          {stats.adimplencia > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Adimplência</span>
                <span>{stats.adimplencia}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${stats.adimplencia}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Pendentes</p>
            <div className="size-9 rounded-lg bg-amber-50 grid place-items-center">
              <Clock className="size-4 text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pendentes.length}</p>
          {stats.pendentes.length > 0 && (
            <p className="text-xs text-amber-600 mt-2">
              Total: {brl(stats.pendentes.reduce((a, m) => a + m.valor, 0))}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Vencidas</p>
            <div className="size-9 rounded-lg bg-red-50 grid place-items-center">
              <AlertTriangle className="size-4 text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.vencidas.length}</p>
          {stats.vencidas.length > 0 && (
            <p className="text-xs text-red-600 mt-2">
              Total: {brl(stats.vencidas.reduce((a, m) => a + m.valor, 0))}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Pagas</p>
            <div className="size-9 rounded-lg bg-blue-50 grid place-items-center">
              <TrendingUp className="size-4 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pagas.length}</p>
          <p className="text-xs text-gray-400 mt-2">{stats.totalValor > 0 ? `${Math.round((stats.pagas.length / mensalidades.length) * 100)}% do total` : "—"}</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex items-center justify-center">
          <Loader2 className="size-6 animate-spin text-[#D62828]" />
        </div>
      ) : (
        Object.entries(mensalidadesPorAluno).map(([alunoNome, ms]) => {
          const pendentes = ms.filter((m) => m.status === "pendente" || m.status === "atrasado");
          const totalDevido = pendentes.reduce((s, m) => s + m.valor, 0);

          return (
            <div key={alunoNome} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#D62828]/5 via-transparent to-transparent px-6 py-5 border-b border-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-[#D62828]/5 grid place-items-center">
                      <User className="size-6 text-[#D62828]" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{alunoNome}</h3>
                      <p className="text-xs text-gray-400">{ms.length} mensalidade{ms.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-px bg-gray-50">
                <div className="bg-white p-5 text-center">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Mensalidades</p>
                  <p className="text-xl font-bold text-gray-900">{ms.length}</p>
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

              <div>
                <div className="px-6 py-3 border-b border-gray-50 bg-gray-50/30">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mensalidades</p>
                </div>
                {ms.map((m, idx) => {
                  const StatusIcon = m.status === "pago" ? CheckCircle2 : m.status === "atrasado" ? AlertCircle : Clock;
                  const statusColor = m.status === "pago" ? "text-emerald-500" : m.status === "atrasado" ? "text-red-500" : "text-amber-500";
                  const bgColor = m.status === "pago" ? "bg-emerald-50" : m.status === "atrasado" ? "bg-red-50" : "bg-amber-50";
                  return (
                    <div key={m.id} className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors ${idx < ms.length - 1 ? "border-b border-gray-50" : ""}`}>
                      <div className={`size-10 rounded-lg ${bgColor} grid place-items-center flex-shrink-0`}>
                        <StatusIcon className={`size-5 ${statusColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{m.mesReferencia}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-xs font-medium ${statusColor}`}>
                                {m.status === "pago" ? "Pago" : m.status === "atrasado" ? "Atrasado" : "Pendente"}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className={`text-sm font-bold ${statusColor}`}>
                              {brl(m.valor)}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {m.status === "pago" ? `Pago em ${m.dataPagamento}` : `Vence ${m.dataVencimento}`}
                            </p>
                          </div>
                        </div>
                      </div>
                      {(m.status === "pendente" || m.status === "atrasado") && (
                        <button
                          onClick={() => handlePagar(m)}
                          disabled={pagandoId === m.id}
                          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D62828] text-white text-xs font-semibold hover:bg-[#B01E1E] transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {pagandoId === m.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <ExternalLink className="size-3.5" />
                          )}
                          {pagandoId === m.id ? "Gerando..." : "Pagar"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {pixModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
            {pixModal.status === 'confirmed' ? (
              <>
                <div className="size-16 rounded-full bg-emerald-50 grid place-items-center mx-auto mb-4 animate-bounce">
                  <CheckCircle2 className="size-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-emerald-600 mb-1">Pagamento confirmado!</h3>
                <p className="text-sm text-gray-500">Redirecionando...</p>
              </>
            ) : (
              <>
                <div className="size-12 rounded-full bg-emerald-50 grid place-items-center mx-auto mb-4">
                  <Smartphone className="size-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Pague com PIX</h3>
                <p className="text-sm text-gray-500 mb-6">Escaneie o QR Code abaixo com seu banco</p>
                {pixModal.qrCodeBase64 && (
                  <img
                    src={`data:image/png;base64,${pixModal.qrCodeBase64}`}
                    alt="QR Code PIX"
                    className="size-56 mx-auto mb-6 rounded-xl border border-gray-100"
                  />
                )}
                {pixModal.qrCode && (
                  <>
                    <p className="text-xs text-gray-400 mb-2">Ou copie o código PIX abaixo:</p>
                    <div className="bg-gray-50 rounded-xl p-3 mb-6">
                      <p className="text-xs text-gray-600 break-all font-mono select-all">{pixModal.qrCode}</p>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Aguardando pagamento...</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const origemConfig: Record<OrigemPagamento, { label: string; color: string; icon: LucideIcon }> = {
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
  atrasado: { label: "Atrasado", color: "text-red-600 bg-red-50 ring-1 ring-red-200", icon: AlertCircle },
};

function PagamentosTab() {
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("todas");
  const [pagandoId, setPagandoId] = useState<string | null>(null);
  const [pixModal, setPixModal] = useState<{ qrCode?: string; qrCodeBase64?: string; mensalidadeId: string; status: 'waiting' | 'confirmed' } | null>(null);

  useEffect(() => {
    fetchAssociadoMensalidades()
      .then(setMensalidades)
      .catch(() => toast.error("Erro ao carregar mensalidades"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === "todas") return mensalidades;
    return mensalidades.filter((m) => m.status === filter);
  }, [mensalidades, filter]);

  const pendentes = useMemo(
    () => mensalidades.filter((m) => m.status === "pendente"),
    [mensalidades]
  );
  const vencidas = useMemo(
    () => mensalidades.filter((m) => m.status === "atrasado"),
    [mensalidades]
  );
  const pagas = useMemo(
    () => mensalidades.filter((m) => m.status === "pago"),
    [mensalidades]
  );

  const handlePagar = async (m: Mensalidade) => {
    if (pagandoId) return;
    setPagandoId(m.id);
    try {
      const result = await gerarCobrancaMensalidade(m.id);
      if (result.success && result.data?.pix_qr_code_base64) {
        setPixModal({
          qrCode: result.data.pix_qr_code,
          qrCodeBase64: result.data.pix_qr_code_base64,
          mensalidadeId: m.id,
          status: 'waiting',
        });
      } else if (result.success && result.data?.payment_url) {
        window.location.href = result.data.payment_url;
      } else {
        toast.error(result.message || "Erro ao gerar cobrança");
      }
    } catch {
      toast.error("Erro ao conectar com Mercado Pago");
    } finally {
      setPagandoId(null);
    }
  };

  const fecharPix = () => {
    setPixModal(null);
    fetchAssociadoMensalidades().then(setMensalidades).catch(() => {});
  };

  useEffect(() => {
    if (!pixModal || pixModal.status === 'confirmed') return;
    const id = setInterval(async () => {
      try {
        const res = await consultarStatusPagamento(pixModal.mensalidadeId);
        if (res.data?.status === "pago") {
          setPixModal((prev) => prev ? { ...prev, status: 'confirmed' } : null);
          setTimeout(fecharPix, 2000);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(id);
  }, [pixModal]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-[#D62828]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 size-24 bg-amber-50 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Pendentes</p>
              <div className="size-9 rounded-lg bg-amber-50 grid place-items-center">
                <Clock className="size-4 text-amber-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{pendentes.length}</p>
            <p className="text-xs text-gray-400 mt-1">
              {pendentes.length > 0
                ? `Total: ${brl(pendentes.reduce((a, m) => a + m.valor, 0))}`
                : "Nenhuma pendente"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 size-24 bg-red-50 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Vencidas</p>
              <div className="size-9 rounded-lg bg-red-50 grid place-items-center">
                <AlertCircle className="size-4 text-red-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{vencidas.length}</p>
            <p className="text-xs text-gray-400 mt-1">
              {vencidas.length > 0
                ? `Total: ${brl(vencidas.reduce((a, m) => a + m.valor, 0))}`
                : "Nenhuma vencida"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 size-24 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Pagas</p>
              <div className="size-9 rounded-lg bg-emerald-50 grid place-items-center">
                <CheckCircle2 className="size-4 text-emerald-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{pagas.length}</p>
            <p className="text-xs text-gray-400 mt-1">
              Total: {brl(pagas.reduce((a, m) => a + m.valor, 0))}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-900">Mensalidades</h3>
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl p-1">
            {[
              { key: "todas", label: "Todas" },
              { key: "pendente", label: "Pendentes" },
              { key: "pago", label: "Pagas" },
              { key: "atrasado", label: "Vencidas" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f.key
                    ? "bg-[#D62828] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Receipt className="size-12 mb-4 opacity-30" />
            <p className="text-sm font-medium">Nenhuma mensalidade encontrada</p>
            <p className="text-xs text-gray-300 mt-1">Tente alterar o filtro para ver mais resultados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="text-left py-3.5 px-4 text-gray-400 font-medium text-xs uppercase tracking-wider">Mês</th>
                  <th className="text-left py-3.5 px-4 text-gray-400 font-medium text-xs uppercase tracking-wider">Vencimento</th>
                  <th className="text-right py-3.5 px-4 text-gray-400 font-medium text-xs uppercase tracking-wider">Valor</th>
                  <th className="text-center py-3.5 px-4 text-gray-400 font-medium text-xs uppercase tracking-wider">Status</th>
                  <th className="text-center py-3.5 px-4 text-gray-400 font-medium text-xs uppercase tracking-wider">Origem</th>
                  <th className="text-center py-3.5 px-4 text-gray-400 font-medium text-xs uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, idx) => {
                  const StatusIcon = statusConfig[m.status]?.icon || Clock;
                  const origem = m.origem ? origemConfig[m.origem] : null;
                  const OrigemIcon = origem?.icon || Shield;
                  return (
                    <tr key={m.id} className={`hover:bg-gray-50/50 transition-colors ${idx < filtered.length - 1 ? "border-b border-gray-50" : ""}`}>
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">{m.mesReferencia}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-500">{m.dataVencimento}</td>
                      <td className="py-4 px-4 text-right font-semibold text-gray-900">{brl(m.valor)}</td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[m.status]?.color}`}>
                            <StatusIcon className="size-3" />
                            {statusConfig[m.status]?.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center">
                          {origem ? (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${origem.color}`}>
                              <OrigemIcon className="size-3" />
                              {origem.label}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center">
                          {m.status === "pendente" || m.status === "atrasado" ? (
                            <button
                              onClick={() => handlePagar(m)}
                              disabled={pagandoId === m.id}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D62828] text-white text-xs font-semibold hover:bg-[#B01E1E] transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {pagandoId === m.id ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <ExternalLink className="size-3.5" />
                              )}
                              {pagandoId === m.id ? "Gerando..." : "Pagar agora"}
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-500 font-medium">
                              <CheckCircle2 className="size-3.5" />
                              Quitado
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pixModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
            {pixModal.status === 'confirmed' ? (
              <>
                <div className="size-16 rounded-full bg-emerald-50 grid place-items-center mx-auto mb-4 animate-bounce">
                  <CheckCircle2 className="size-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-emerald-600 mb-1">Pagamento confirmado!</h3>
                <p className="text-sm text-gray-500">Redirecionando...</p>
              </>
            ) : (
              <>
                <div className="size-12 rounded-full bg-emerald-50 grid place-items-center mx-auto mb-4">
                  <Smartphone className="size-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Pague com PIX</h3>
                <p className="text-sm text-gray-500 mb-6">Escaneie o QR Code abaixo com seu banco</p>
                {pixModal.qrCodeBase64 && (
                  <img
                    src={`data:image/png;base64,${pixModal.qrCodeBase64}`}
                    alt="QR Code PIX"
                    className="size-56 mx-auto mb-6 rounded-xl border border-gray-100"
                  />
                )}
                {pixModal.qrCode && (
                  <>
                    <p className="text-xs text-gray-400 mb-2">Ou copie o código PIX abaixo:</p>
                    <div className="bg-gray-50 rounded-xl p-3 mb-6">
                      <p className="text-xs text-gray-600 break-all font-mono select-all">{pixModal.qrCode}</p>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Aguardando pagamento...</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function HistoricoTab() {
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssociadoMensalidades()
      .then(setMensalidades)
      .catch(() => toast.error("Erro ao carregar histórico"))
      .finally(() => setLoading(false));
  }, []);

  const groupedByYear = useMemo(() => {
    const groups: Record<string, Mensalidade[]> = {};
    const sorted = [...mensalidades].sort((a, b) => {
      const parse = (d: string) => {
        const [dd, mm, yyyy] = d.split("/").map(Number);
        return new Date(yyyy, mm - 1, dd).getTime();
      };
      return parse(b.dataVencimento) - parse(a.dataVencimento);
    });
    for (const m of sorted) {
      const year = m.dataVencimento.split("/")[2];
      if (!groups[year]) groups[year] = [];
      groups[year].push(m);
    }
    return groups;
  }, [mensalidades]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-[#D62828]" />
      </div>
    );
  }

  const years = Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">Histórico de Contribuições</h3>
        <p className="text-xs text-gray-400 mt-0.5">Registro completo de todas as suas mensalidades</p>
      </div>

      {years.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <History className="size-12 mb-4 opacity-30" />
          <p className="text-sm font-medium">Nenhuma contribuição registrada</p>
          <p className="text-xs text-gray-300 mt-1">Suas mensalidades aparecerão aqui assim que forem criadas</p>
        </div>
      ) : (
        <div className="px-6 py-5">
          {years.map((year, yearIdx) => {
            const ms = groupedByYear[year];
            const totalPago = ms.filter((m) => m.status === "pago").reduce((a, m) => a + m.valor, 0);
            const totalGeral = ms.reduce((a, m) => a + m.valor, 0);
            return (
              <div key={year} className={yearIdx < years.length - 1 ? "mb-8" : ""}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-[#D62828]/5 grid place-items-center">
                      <Calendar className="size-5 text-[#D62828]" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900">{year}</h4>
                      <p className="text-xs text-gray-400">{ms.length} mensalidade{ms.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{brl(totalPago)}</p>
                    <p className="text-xs text-gray-400">de {brl(totalGeral)}</p>
                  </div>
                </div>

                {totalGeral > 0 && (
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-5">
                    <div
                      className="h-full bg-gradient-to-r from-[#D62828] to-[#D62828]/60 rounded-full transition-all duration-700"
                      style={{ width: `${Math.round((totalPago / totalGeral) * 100)}%` }}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  {ms.map((m) => {
                    const StatusIcon = statusConfig[m.status]?.icon || Clock;
                    const origem = m.origem ? origemConfig[m.origem] : null;
                    const OrigemIcon = origem?.icon || Shield;
                    return (
                      <div key={m.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className={`size-9 rounded-lg grid place-items-center flex-shrink-0 ${
                          m.status === "pago" ? "bg-emerald-50" : m.status === "atrasado" ? "bg-red-50" : "bg-amber-50"
                        }`}>
                          <StatusIcon className={`size-4 ${
                            m.status === "pago" ? "text-emerald-500" : m.status === "atrasado" ? "text-red-500" : "text-amber-500"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900">{m.mesReferencia}</p>
                            <p className="text-sm font-semibold text-gray-900">{brl(m.valor)}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${statusConfig[m.status]?.color}`}>
                              <StatusIcon className="size-3" />
                              {statusConfig[m.status]?.label}
                            </span>
                            {origem && (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${origem.color}`}>
                                <OrigemIcon className="size-3" />
                                {origem.label}
                              </span>
                            )}
                            {m.dataPagamento ? (
                              <span className="text-xs text-gray-400">Pago em {m.dataPagamento}</span>
                            ) : (
                              <span className="text-xs text-gray-400">Vence {m.dataVencimento}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DadosTab({ associado }: { associado: AssociadoData }) {
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(associado.nome);
  const [telefone, setTelefone] = useState(associado.telefone);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAssociado({ nome, telefone });
      const updated = { ...associado, nome, telefone };
      localStorage.setItem("associado_data", JSON.stringify(updated));
      toast.success("Dados atualizados com sucesso!");
      setEditing(false);
    } catch {
      toast.error("Erro ao atualizar dados.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Dados Cadastrais</h3>
            <p className="text-xs text-gray-400 mt-0.5">Gerencie suas informações pessoais</p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D62828]/5 text-[#D62828] text-sm font-medium hover:bg-[#D62828]/10 transition-colors"
            >
              <Settings className="size-4" />
              Editar
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Nome completo</label>
            {editing ? (
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:border-[#D62828] focus:ring-2 focus:ring-[#D62828]/10 transition-all"
              />
            ) : (
              <div className="h-11 flex items-center px-4 bg-gray-50 rounded-xl text-sm font-medium text-gray-900">
                <User className="size-4 text-gray-400 mr-2 flex-shrink-0" />
                {associado.nome}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">E-mail</label>
            <div className="h-11 flex items-center px-4 bg-gray-50 rounded-xl text-sm text-gray-900">
              <Mail className="size-4 text-gray-400 mr-2 flex-shrink-0" />
              {associado.email}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Telefone</label>
            {editing ? (
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(maskPhone(e.target.value))}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:border-[#D62828] focus:ring-2 focus:ring-[#D62828]/10 transition-all"
              />
            ) : (
              <div className="h-11 flex items-center px-4 bg-gray-50 rounded-xl text-sm font-medium text-gray-900">
                <Phone className="size-4 text-gray-400 mr-2 flex-shrink-0" />
                {associado.telefone}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">CPF</label>
            <div className="h-11 flex items-center px-4 bg-gray-50 rounded-xl text-sm font-medium text-gray-900">
              <Shield className="size-4 text-gray-400 mr-2 flex-shrink-0" />
              {maskCPF(associado.cpf)}
            </div>
          </div>
        </div>

        {associado.alunos.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-50">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              {associado.alunos.length === 1 ? "Aluno vinculado" : "Alunos vinculados"}
            </label>
            <div className="space-y-2">
              {associado.alunos.map((al) => (
                <div key={al.id} className="h-11 flex items-center px-4 bg-gradient-to-r from-[#D62828]/5 to-transparent rounded-xl text-sm font-medium text-gray-900">
                  <User className="size-4 text-[#D62828] mr-2 flex-shrink-0" />
                  {al.nome}
                </div>
              ))}
            </div>
          </div>
        )}

        {editing && (
          <div className="mt-8 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-11 px-6 rounded-xl bg-[#D62828] text-white text-sm font-semibold hover:bg-[#B01E1E] transition-all shadow-sm hover:shadow-md disabled:opacity-50 active:scale-[0.98]"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Salvando...
                </span>
              ) : "Salvar alterações"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setNome(associado.nome);
                setTelefone(associado.telefone);
              }}
              className="h-11 px-6 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50">
        <p className="text-xs text-gray-400 flex items-center gap-1.5">
          <Shield className="size-3.5" />
          Dados protegidos pela Lei Geral de Proteção de Dados (LGPD)
        </p>
      </div>
    </div>
  );
}

function BeneficiosTab() {
  const beneficios = [
    { icon: Gift, title: "Descontos Exclusivos", desc: "Aproveite descontos especiais em eventos e atividades da escola." },
    { icon: Users, title: "Participação Ativa", desc: "Participe das decisões importantes da associação de pais e mestres." },
    { icon: TrendingUp, title: "Acompanhamento", desc: "Acompanhe de perto o desenvolvimento educacional do seu filho." },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">Benefícios</h3>
        <p className="text-xs text-gray-400 mt-0.5">Vantagens de ser um sócio ativo</p>
      </div>
      <div className="px-6 py-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {beneficios.map((b) => (
          <div key={b.title} className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-sm transition-shadow">
            <div className="size-10 rounded-xl bg-[#D62828]/5 grid place-items-center mb-4">
              <b.icon className="size-5 text-[#D62828]" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">{b.title}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComunidadeTab() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">Comunidade</h3>
        <p className="text-xs text-gray-400 mt-0.5">Conecte-se com outros associados</p>
      </div>
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <div className="size-16 rounded-full bg-gray-50 grid place-items-center mb-4">
          <Users className="size-8 text-gray-300" />
        </div>
        <p className="text-sm font-medium text-gray-500">Em breve</p>
        <p className="text-xs text-gray-300 mt-1">O espaço da comunidade está sendo preparado</p>
      </div>
    </div>
  );
}
