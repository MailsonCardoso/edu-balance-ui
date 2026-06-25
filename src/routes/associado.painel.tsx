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
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/Primitives";
import { brl } from "@/lib/format";
import {
  getAssociado,
  updateAssociado,
  type AssociadoData,
} from "@/lib/api/associado";
import {
  fetchAssociadoMensalidades,
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
    const token = localStorage.getItem("associado_token");
    if (!token) {
      navigate({ to: "/associado", replace: true });
      return;
    }

    const stored = localStorage.getItem("associado_data");
    if (stored) {
      setAssociado(JSON.parse(stored));
    }

    getAssociado()
      .then((res) => {
        if (res.success && res.associado) {
          setAssociado(res.associado);
          localStorage.setItem("associado_data", JSON.stringify(res.associado));
        }
      })
      .catch(() => {
        localStorage.removeItem("associado_token");
        localStorage.removeItem("associado_data");
        navigate({ to: "/associado", replace: true });
      })
      .finally(() => setLoading(false));
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
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!associado) return null;

  const ActiveIcon = menuItems.find((m) => m.id === tab)?.icon || User;

  return (
    <>
      <PageHeader
        title={`Olá, ${associado.nome.split(" ")[0]}!`}
        description="Bem-vindo ao seu painel de associado"
      />

      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                      tab === item.id
                        ? "bg-[#D62828]/5 text-[#D62828]"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="size-[18px]" />
                    {item.label}
                  </button>
                );
              })}
              <hr className="my-2 border-gray-100" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors text-left"
              >
                <LogOut className="size-[18px]" />
                Sair
              </button>
            </div>
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
    </>
  );
}

function PainelTab({ associado }: { associado: AssociadoData }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="size-16 rounded-full bg-[#D62828]/10 grid place-items-center">
          <User className="size-8 text-[#D62828]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{associado.nome}</h3>
          <p className="text-sm text-gray-500">Sócio desde {associado.created_at}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Status", value: associado.status === "ativo" ? "Ativo" : associado.status, color: "text-emerald-600 bg-emerald-50" },
          { label: "Email", value: associado.email },
          { label: "Telefone", value: associado.telefone },
        ].map((item) => (
          <div key={item.label} className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">{item.label}</p>
            <p className={`text-sm font-medium ${item.color || "text-gray-900"}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {associado.nome_aluno && (
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Aluno vinculado</p>
          <p className="text-sm font-medium text-gray-900">{associado.nome_aluno}</p>
        </div>
      )}
    </div>
  );
}

const origemConfig: Record<OrigemPagamento, { label: string; color: string; icon: LucideIcon }> = {
  mercadopago: { label: "Mercado Pago", color: "text-sky-700 bg-sky-50", icon: ArrowUpRight },
  caixa: { label: "Caixa Econômica", color: "text-blue-700 bg-blue-50", icon: Building2 },
  admin: { label: "Admin", color: "text-gray-700 bg-gray-100", icon: Shield },
  pix_manual: { label: "PIX", color: "text-emerald-700 bg-emerald-50", icon: Smartphone },
  dinheiro: { label: "Dinheiro", color: "text-amber-700 bg-amber-50", icon: Banknote },
  transferencia: { label: "Transferência", color: "text-purple-700 bg-purple-50", icon: HandCoins },
};

const statusConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  pago: { label: "Pago", color: "text-emerald-600 bg-emerald-50", icon: CheckCircle2 },
  pendente: { label: "Pendente", color: "text-amber-600 bg-amber-50", icon: Clock },
  atrasado: { label: "Atrasado", color: "text-red-600 bg-red-50", icon: AlertCircle },
};

function PagamentosTab() {
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("todas");

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
  const pagasEsteMes = useMemo(
    () =>
      mensalidades.filter((m) => {
        if (m.status !== "pago" || !m.dataPagamento) return false;
        const [d, mês, a] = m.dataPagamento.split("/").map(Number);
        const hoje = new Date();
        return mês === hoje.getMonth() + 1 && a === hoje.getFullYear();
      }),
    [mensalidades]
  );

  const handlePagar = (m: Mensalidade) => {
    toast.info("Integração com Mercado Pago em breve!");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 flex items-center justify-center h-64">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 mb-1">Pendentes</p>
          <p className="text-2xl font-bold text-amber-600">{pendentes.length}</p>
          <p className="text-xs text-gray-400 mt-1">
            {pendentes.length > 0
              ? `Total: ${brl(pendentes.reduce((a, m) => a + m.valor, 0))}`
              : "Nenhuma pendente"}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 mb-1">Vencidas</p>
          <p className="text-2xl font-bold text-red-600">{vencidas.length}</p>
          <p className="text-xs text-gray-400 mt-1">
            {vencidas.length > 0
              ? `Total: ${brl(vencidas.reduce((a, m) => a + m.valor, 0))}`
              : "Nenhuma vencida"}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 mb-1">Pago este mês</p>
          <p className="text-2xl font-bold text-emerald-600">
            {brl(pagasEsteMes.reduce((a, m) => a + m.valor, 0))}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {pagasEsteMes.length} mensalidade{pagasEsteMes.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {[
            { key: "todas", label: "Todas" },
            { key: "pendente", label: "Pendentes" },
            { key: "pago", label: "Pagas" },
            { key: "atrasado", label: "Vencidas" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f.key
                  ? "bg-[#D62828] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <CreditCard className="size-10 mb-3 opacity-50" />
            <p className="text-sm">Nenhuma mensalidade encontrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Mês</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Vencimento</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-medium">Valor</th>
                  <th className="text-center py-3 px-2 text-gray-400 font-medium">Status</th>
                  <th className="text-center py-3 px-2 text-gray-400 font-medium">Origem</th>
                  <th className="text-center py-3 px-2 text-gray-400 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const StatusIcon = statusConfig[m.status]?.icon || Clock;
                  const origem = m.origem ? origemConfig[m.origem] : null;
                  const OrigemIcon = origem?.icon || Shield;
                  return (
                    <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-2 font-medium text-gray-900">{m.mesReferencia}</td>
                      <td className="py-3 px-2 text-gray-500">{m.dataVencimento}</td>
                      <td className="py-3 px-2 text-right font-medium text-gray-900">{brl(m.valor)}</td>
                      <td className="py-3 px-2">
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${statusConfig[m.status]?.color}`}>
                            <StatusIcon className="size-3" />
                            {statusConfig[m.status]?.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex justify-center">
                          {origem ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${origem.color}`}>
                              <OrigemIcon className="size-3" />
                              {origem.label}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex justify-center">
                          {m.status === "pendente" || m.status === "atrasado" ? (
                            <button
                              onClick={() => handlePagar(m)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#D62828] text-white text-xs font-medium hover:bg-[#D62828]/90 transition-colors"
                            >
                              Pagar
                              <ExternalLink className="size-3" />
                            </button>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
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

  const sorted = useMemo(
    () =>
      [...mensalidades].sort((a, b) => {
        const parseDate = (d: string) => {
          const [dd, mm, yyyy] = d.split("/").map(Number);
          return new Date(yyyy, mm - 1, dd).getTime();
        };
        const dateA = a.dataPagamento ? parseDate(a.dataPagamento) : parseDate(a.dataVencimento);
        const dateB = b.dataPagamento ? parseDate(b.dataPagamento) : parseDate(b.dataVencimento);
        return dateB - dateA;
      }),
    [mensalidades]
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 flex items-center justify-center h-64">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Histórico de Contribuições</h3>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
          <History className="size-10 mb-3 opacity-50" />
          <p className="text-sm">Nenhuma contribuição registrada ainda.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-200" />
          <div className="space-y-0">
            {sorted.map((m, idx) => {
              const StatusIcon = statusConfig[m.status]?.icon || Clock;
              const origem = m.origem ? origemConfig[m.origem] : null;
              const OrigemIcon = origem?.icon || Shield;
              const isLast = idx === sorted.length - 1;

              return (
                <div key={m.id} className="relative flex gap-5 pb-6">
                  <div className="relative z-10 flex-shrink-0 grid place-items-center">
                    <div
                      className={`size-10 rounded-full grid place-items-center ${
                        m.status === "pago"
                          ? "bg-emerald-50"
                          : m.status === "atrasado"
                          ? "bg-red-50"
                          : "bg-amber-50"
                      }`}
                    >
                      <StatusIcon
                        className={`size-5 ${
                          m.status === "pago"
                            ? "text-emerald-500"
                            : m.status === "atrasado"
                            ? "text-red-500"
                            : "text-amber-500"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-gray-900">{m.mesReferencia}</p>
                      <p className="text-sm font-semibold text-gray-900">{brl(m.valor)}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
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
                      {m.dataPagamento && (
                        <span className="text-xs text-gray-400">
                          Pago em {m.dataPagamento}
                        </span>
                      )}
                      {!m.dataPagamento && (
                        <span className="text-xs text-gray-400">
                          Vence {m.dataVencimento}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
      toast.success("Dados atualizados.");
      setEditing(false);
    } catch {
      toast.error("Erro ao atualizar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados Cadastrais</h3>

      <div className="space-y-4 max-w-md">
        <div>
          <p className="text-xs text-gray-400 mb-1">Nome</p>
          {editing ? (
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#D62828]"
            />
          ) : (
            <p className="text-sm font-medium text-gray-900">{associado.nome}</p>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Email</p>
          <p className="text-sm text-gray-900">{associado.email}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Telefone</p>
          {editing ? (
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#D62828]"
            />
          ) : (
            <p className="text-sm text-gray-900">{associado.telefone}</p>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">CPF</p>
          <p className="text-sm text-gray-900">{associado.cpf}</p>
        </div>
      </div>

      <div className="mt-6">
        {editing ? (
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-10 px-5 rounded-lg bg-[#D62828] text-white text-sm font-medium hover:bg-[#D62828]/90 transition-colors disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="h-10 px-5 rounded-lg border border-[#D62828] text-[#D62828] text-sm font-medium hover:bg-[#D62828]/5 transition-colors"
          >
            Editar dados
          </button>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <Shield className="size-3" /> Dados protegidos pela LGPD.
        </p>
      </div>
    </div>
  );
}

function BeneficiosTab() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefícios</h3>
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <Gift className="size-10 mb-3 opacity-50" />
        <p className="text-sm">Em breve você terá acesso a benefícios exclusivos.</p>
      </div>
    </div>
  );
}

function ComunidadeTab() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Comunidade</h3>
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <Users className="size-10 mb-3 opacity-50" />
        <p className="text-sm">Em breve você poderá participar das discussões.</p>
      </div>
    </div>
  );
}
