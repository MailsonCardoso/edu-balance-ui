import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/Primitives";
import {
  getAssociado,
  updateAssociado,
  type AssociadoData,
} from "@/lib/api/associado";

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

function PagamentosTab() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">PIX e Boletos</h3>
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <CreditCard className="size-10 mb-3 opacity-50" />
        <p className="text-sm">Em breve você poderá pagar suas mensalidades aqui.</p>
      </div>
    </div>
  );
}

function HistoricoTab() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Contribuições</h3>
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <History className="size-10 mb-3 opacity-50" />
        <p className="text-sm">Em breve todas as suas contribuições estarão disponíveis aqui.</p>
      </div>
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
