import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  User,
  CreditCard,
  History,
  Settings,
  Gift,
  Users,
  Mail,
  Phone,
  Calendar,
  CheckCheck,
  Clock,
  AlertTriangle,
  TrendingUp,
  Receipt,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { brl } from "@/lib/format";
import { getAssociado, updateAssociado, type AssociadoData } from "@/lib/api/associado";
import {
  fetchAssociadoMensalidades,
  gerarCobrancaMensalidade,
  consultarStatusPagamento,
} from "@/lib/api/associado-mensalidades";
import type { Mensalidade } from "@/lib/mock-data";
import {
  ProfileCard,
  InfoTile,
  StatCard,
  SectionTitle,
  FloatingTabBar,
  AppHeader,
} from "@/components/socio/socio";
import { MensalidadeRow } from "@/components/socio/mensalidade";
import { PixSheet } from "@/components/socio/PixSheet";

export const Route = createFileRoute("/associado/painel")({
  component: PainelAssociado,
});

const menuItems = [
  { id: "painel", label: "Painel", icon: User },
  { id: "pagamentos", label: "Pagamentos", icon: CreditCard },
  { id: "historico", label: "Histórico", icon: History },
  { id: "dados", label: "Dados", icon: Settings },
  { id: "beneficios", label: "Benefícios", icon: Gift },
  { id: "comunidade", label: "Comunidade", icon: Users },
];

// referência compartilhada para refresh da lista após pagamento PIX
let setMensalidadesGlobal: (m: Mensalidade[]) => void = () => {};

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
      if (!stored) navigate({ to: "/associado", replace: true });
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
        <div className="size-10 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
      </div>
    );
  }

  if (!associado) return null;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      <AppHeader nome={associado.nome} onLogout={handleLogout} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-4 sm:px-6 lg:px-8 lg:pb-10 lg:pt-6">
        <div className="grid gap-6 lg:grid-cols-4">
          <aside className="hidden lg:col-span-1">
            <nav className="sticky top-24 space-y-1 rounded-3xl border border-black/[0.04] bg-white p-2 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = tab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive ? "bg-brand text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="min-w-0 lg:col-span-3">
            {tab === "painel" && <PainelTab associado={associado} />}
            {tab === "pagamentos" && <PagamentosTab />}
            {tab === "historico" && <HistoricoTab />}
            {tab === "dados" && <DadosTab associado={associado} />}
            {tab === "beneficios" && <BeneficiosTab />}
            {tab === "comunidade" && <ComunidadeTab />}
          </div>
        </div>
      </main>

      <FloatingTabBar items={menuItems} active={tab} onChange={setTab} />
    </div>
  );
}

function usePixFlow() {
  const [pagandoId, setPagandoId] = useState<string | null>(null);
  const [pix, setPix] = useState<{
    qrCode?: string;
    qrCodeBase64?: string;
    mensalidadeId: string;
    status: "waiting" | "confirmed";
  } | null>(null);

  const handlePagar = async (m: Mensalidade) => {
    if (pagandoId) return;
    setPagandoId(m.id);
    try {
      const result = await gerarCobrancaMensalidade(m.id);
      if (result.success && result.data?.pix_qr_code_base64) {
        setPix({
          qrCode: result.data.pix_qr_code,
          qrCodeBase64: result.data.pix_qr_code_base64,
          mensalidadeId: m.id,
          status: "waiting",
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
    setPix(null);
    fetchAssociadoMensalidades()
      .then(setMensalidadesGlobal)
      .catch(() => {});
  };

  useEffect(() => {
    if (!pix || pix.status === "confirmed") return;
    const id = setInterval(async () => {
      try {
        const res = await consultarStatusPagamento(pix.mensalidadeId);
        if (res.data?.status === "pago") {
          setPix((prev) => (prev ? { ...prev, status: "confirmed" } : null));
          setTimeout(fecharPix, 2000);
        }
      } catch {
        // polling ignorado
      }
    }, 3000);
    return () => clearInterval(id);
  }, [pix]);

  return { pagandoId, pix, handlePagar, fecharPix };
}

function PainelTab({ associado }: { associado: AssociadoData }) {
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);
  const [loading, setLoading] = useState(true);
  const { pagandoId, pix, handlePagar, fecharPix } = usePixFlow();
  setMensalidadesGlobal = setMensalidades;

  useEffect(() => {
    fetchAssociadoMensalidades()
      .then(setMensalidades)
      .catch(() => toast.error("Erro ao carregar mensalidades"))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const pendentes = mensalidades.filter((m) => m.status === "pendente");
    const vencidas = mensalidades.filter((m) => m.status === "atrasado");
    const pagas = mensalidades.filter((m) => m.status === "pago");
    const pagoValor = pagas.reduce((a, m) => a + m.valor, 0);
    return { pendentes, vencidas, pagas, pagoValor };
  }, [mensalidades]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-10 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
      </div>
    );
  }

  const infoTiles = [
    { icon: Mail, label: "E-mail", value: associado.email },
    { icon: Phone, label: "Telefone", value: associado.telefone },
    { icon: Calendar, label: "Sócio desde", value: associado.created_at },
    { icon: User, label: "CPF", value: associado.cpf },
  ];

  return (
    <div className="space-y-6">
      <ProfileCard nome={associado.nome} status={associado.status} desde={associado.created_at} />

      <div className="grid grid-cols-2 gap-3">
        {infoTiles.map((t) => (
          <InfoTile key={t.label} icon={t.icon} label={t.label} value={t.value} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total pago"
          value={brl(stats.pagoValor)}
          icon={CheckCheck}
          tone="emerald"
        />
        <StatCard
          label="Pendentes"
          value={String(stats.pendentes.length)}
          sub={
            stats.pendentes.length
              ? brl(stats.pendentes.reduce((a, m) => a + m.valor, 0))
              : undefined
          }
          icon={Clock}
          tone="amber"
        />
        <StatCard
          label="Vencidas"
          value={String(stats.vencidas.length)}
          sub={
            stats.vencidas.length ? brl(stats.vencidas.reduce((a, m) => a + m.valor, 0)) : undefined
          }
          icon={AlertTriangle}
          tone="red"
        />
        <StatCard
          label="Pagas"
          value={String(stats.pagas.length)}
          sub={
            stats.totalValor > 0
              ? `${Math.round((stats.pagas.length / mensalidades.length) * 100)}%`
              : undefined
          }
          icon={TrendingUp}
          tone="blue"
        />
      </div>

      <PixSheet
        open={!!pix}
        status={pix?.status ?? "waiting"}
        qrCodeBase64={pix?.qrCodeBase64}
        qrCode={pix?.qrCode}
        onClose={fecharPix}
      />
    </div>
  );
}

function PagamentosTab() {
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todas");
  const { pagandoId, pix, handlePagar, fecharPix } = usePixFlow();
  setMensalidadesGlobal = setMensalidades;

  useEffect(() => {
    fetchAssociadoMensalidades()
      .then(setMensalidades)
      .catch(() => toast.error("Erro ao carregar mensalidades"))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const pendentes = mensalidades.filter((m) => m.status === "pendente");
    const vencidas = mensalidades.filter((m) => m.status === "atrasado");
    const pagas = mensalidades.filter((m) => m.status === "pago");
    return { pendentes, vencidas, pagas };
  }, [mensalidades]);

  const filtered = useMemo(() => {
    if (filter === "todas") return mensalidades;
    return mensalidades.filter((m) => m.status === filter);
  }, [mensalidades, filter]);

  const temMultiplosAlunos = useMemo(
    () => new Set(mensalidades.map((m) => m.alunoNome)).size > 1,
    [mensalidades],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-10 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
      </div>
    );
  }

  const filters = [
    { key: "todas", label: "Todas" },
    { key: "pendente", label: "Pendentes" },
    { key: "pago", label: "Pagas" },
    { key: "atrasado", label: "Vencidas" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Pendentes"
          value={String(stats.pendentes.length)}
          icon={Clock}
          tone="amber"
        />
        <StatCard
          label="Vencidas"
          value={String(stats.vencidas.length)}
          icon={AlertTriangle}
          tone="red"
        />
        <StatCard
          label="Pagas"
          value={String(stats.pagas.length)}
          icon={CheckCheck}
          tone="emerald"
        />
      </div>

      <div>
        <SectionTitle title="Mensalidades" subtitle="Toque em pagar para gerar o PIX" />
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                filter === f.key
                  ? "bg-brand text-white shadow-sm"
                  : "bg-white text-gray-500 shadow-[0_4px_14px_-8px_rgba(0,0,0,0.15)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <Receipt className="mx-auto mb-3 size-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">Nada por aqui</p>
          <p className="mt-1 text-xs text-gray-400">Altere o filtro para ver mais resultados</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-black/[0.04] bg-white shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]">
          <div className="divide-y divide-gray-50">
            {filtered.map((m) => (
              <MensalidadeRow
                key={m.id}
                m={m}
                onPagar={handlePagar}
                pagando={pagandoId === m.id}
                showAluno={temMultiplosAlunos}
              />
            ))}
          </div>
        </div>
      )}

      <PixSheet
        open={!!pix}
        status={pix?.status ?? "waiting"}
        qrCodeBase64={pix?.qrCodeBase64}
        qrCode={pix?.qrCode}
        onClose={fecharPix}
      />
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
      <div className="flex items-center justify-center py-20">
        <div className="size-10 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
      </div>
    );
  }

  const years = Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="space-y-6">
      <SectionTitle title="Histórico" subtitle="Registro de todas as suas contribuições" />
      {years.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <History className="mx-auto mb-3 size-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">Nenhuma contribuição</p>
        </div>
      ) : (
        years.map((year) => {
          const ms = groupedByYear[year];
          const totalPago = ms.filter((m) => m.status === "pago").reduce((a, m) => a + m.valor, 0);
          const totalGeral = ms.reduce((a, m) => a + m.valor, 0);
          return (
            <div
              key={year}
              className="overflow-hidden rounded-3xl border border-black/[0.04] bg-white shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]"
            >
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-2xl bg-brand-light">
                    <Calendar className="size-5 text-brand" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900">{year}</h4>
                    <p className="text-[11px] text-gray-400">{ms.length} mensalidades</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{brl(totalPago)}</p>
                  <p className="text-[11px] text-gray-400">de {brl(totalGeral)}</p>
                </div>
              </div>
              {totalGeral > 0 && (
                <div className="px-4 pb-3">
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark transition-all duration-700"
                      style={{ width: `${Math.round((totalPago / totalGeral) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="divide-y divide-gray-50">
                {ms.map((m) => (
                  <MensalidadeRow key={m.id} m={m} />
                ))}
              </div>
            </div>
          );
        })
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

  const fields = [
    {
      label: "Nome completo",
      value: associado.nome,
      icon: User,
      editable: true,
      state: nome,
      set: setNome,
    },
    { label: "E-mail", value: associado.email, icon: Mail, editable: false },
    {
      label: "Telefone",
      value: associado.telefone,
      icon: Phone,
      editable: true,
      state: telefone,
      set: setTelefone,
    },
    { label: "CPF", value: associado.cpf, icon: User, editable: false },
  ] as const;

  return (
    <div className="space-y-6">
      <SectionTitle title="Dados cadastrais" subtitle="Gerencie suas informações pessoais" />
      <div className="space-y-3">
        {fields.map((f) => (
          <div
            key={f.label}
            className="flex items-center gap-3 rounded-3xl border border-black/[0.04] bg-white p-4 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]"
          >
            <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-light">
              <f.icon className="size-5 text-brand" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                {f.label}
              </p>
              <p className="truncate text-sm font-semibold text-gray-900">{f.value}</p>
            </div>
          </div>
        ))}
      </div>
      {editing ? (
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-2xl bg-brand py-3 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_var(--color-brand)] transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setNome(associado.nome);
              setTelefone(associado.telefone);
            }}
            className="rounded-2xl bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-600 transition-transform active:scale-[0.98]"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full rounded-2xl bg-brand-light py-3 text-sm font-semibold text-brand transition-transform active:scale-[0.98]"
        >
          Editar dados
        </button>
      )}
    </div>
  );
}

function BeneficiosTab() {
  const beneficios = [
    {
      icon: Gift,
      title: "Descontos Exclusivos",
      desc: "Aproveite descontos especiais em eventos e atividades da escola.",
    },
    {
      icon: Users,
      title: "Participação Ativa",
      desc: "Participe das decisões importantes da associação de pais e mestres.",
    },
    {
      icon: TrendingUp,
      title: "Acompanhamento",
      desc: "Acompanhe de perto o desenvolvimento educacional do seu filho.",
    },
  ];
  return (
    <div className="space-y-6">
      <SectionTitle title="Benefícios" subtitle="Vantagens de ser um sócio ativo" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {beneficios.map((b) => (
          <div
            key={b.title}
            className="rounded-3xl border border-black/[0.04] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] animate-fade-up"
          >
            <div className="mb-3 grid size-11 place-items-center rounded-2xl bg-brand-light">
              <b.icon className="size-5 text-brand" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">{b.title}</h4>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComunidadeTab() {
  return (
    <div className="space-y-6">
      <SectionTitle title="Comunidade" subtitle="Conecte-se com outros associados" />
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white py-20 text-center">
        <div className="mb-4 grid size-16 place-items-center rounded-full bg-gray-100">
          <Users className="size-8 text-gray-300" />
        </div>
        <p className="text-sm font-semibold text-gray-500">Em breve</p>
        <p className="mt-1 text-xs text-gray-400">O espaço da comunidade está sendo preparado</p>
      </div>
    </div>
  );
}
