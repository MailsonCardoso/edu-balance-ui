import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  MessageCircle,
  Eye,
  Search,
  Shield,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/shared/Primitives";
import { listarManifestacoes, type OuvidoriaListItem } from "@/lib/api/ouvidoria";

export const Route = createFileRoute("/gestao-ouvidoria")({
  component: GestaoOuvidoria,
});

const tipoLabel: Record<string, string> = {
  sugestao: "Sugestão",
  reclamacao: "Reclamação",
  denuncia: "Denúncia",
  elogio: "Elogio",
  outro: "Outro",
};

const tipoColor: Record<string, string> = {
  sugestao: "text-blue-600 bg-blue-50",
  reclamacao: "text-red-600 bg-red-50",
  denuncia: "text-orange-600 bg-orange-50",
  elogio: "text-emerald-600 bg-emerald-50",
  outro: "text-gray-600 bg-gray-50",
};

const statusIcon: Record<string, typeof Clock> = {
  pendente: Clock,
  respondido: CheckCircle,
};

const statusColor: Record<string, string> = {
  pendente: "text-amber-600 bg-amber-50",
  respondido: "text-emerald-600 bg-emerald-50",
};

function GestaoOuvidoria() {
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [selected, setSelected] = useState<OuvidoriaListItem | null>(null);

  const { data: manifestacoes = [], isLoading } = useQuery({
    queryKey: ["ouvidoria"],
    queryFn: listarManifestacoes,
  });

  const filtered = manifestacoes.filter((item) => {
    if (filtroTipo && item.tipo !== filtroTipo) return false;
    if (filtroStatus && item.status !== filtroStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        item.protocolo.toLowerCase().includes(q) ||
        item.mensagem.toLowerCase().includes(q)
      )
        return true;
      if (!item.anonimo && item.nome?.toLowerCase().includes(q)) return true;
      return false;
    }
    return true;
  });

  if (selected) {
    const StatusIcon = statusIcon[selected.status] || Clock;
    const statusCls = statusColor[selected.status] || "text-gray-600 bg-gray-50";
    const tipoCls = tipoColor[selected.tipo] || "text-gray-600 bg-gray-50";

    return (
      <>
        <PageHeader
          title="Detalhes da Manifestação"
          description={`Protocolo ${selected.protocolo}`}
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setSelected(null)}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6"
          >
            <X className="size-4" /> Voltar
          </button>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Protocolo</p>
                  <p className="text-sm font-mono font-semibold text-gray-900">{selected.protocolo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Data</p>
                  <p className="text-sm text-gray-900">{selected.created_at}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Tipo</p>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${tipoCls}`}>
                    {tipoLabel[selected.tipo] || selected.tipo}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusCls}`}>
                    <StatusIcon className="size-3" />
                    {selected.status === "pendente" ? "Pendente" : "Respondido"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-4">Informações do Autor</h3>
              {selected.anonimo ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Shield className="size-4 text-amber-500" />
                  Manifestação anônima
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Nome</p>
                    <p className="text-sm font-medium text-gray-900">{selected.nome}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">E-mail</p>
                    <p className="text-sm text-gray-900">{selected.email}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-4">Mensagem</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.mensagem}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Ouvidoria"
        description="Manifestações recebidas"
      />

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por protocolo ou mensagem..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary transition-colors bg-white"
          >
            <option value="">Todos os tipos</option>
            {Object.entries(tipoLabel).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary transition-colors bg-white"
          >
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="respondido">Respondido</option>
          </select>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-48 text-sm text-gray-400">
              Carregando...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-sm text-gray-400">
              <MessageCircle className="size-8 mb-2 opacity-50" />
              Nenhuma manifestação encontrada
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Protocolo</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Tipo</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Autor</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Data</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="w-12 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const StatusIcon = statusIcon[item.status] || Clock;
                    const statusCls = statusColor[item.status] || "text-gray-600 bg-gray-50";
                    const tipoCls = tipoColor[item.tipo] || "text-gray-600 bg-gray-50";
                    return (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900">{item.protocolo}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${tipoCls}`}>
                            <MessageCircle className="size-3" />
                            {tipoLabel[item.tipo] || item.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.anonimo ? (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Shield className="size-3" /> Anônimo
                            </span>
                          ) : (
                            <span className="text-sm">{item.nome}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{item.created_at}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusCls}`}>
                            <StatusIcon className="size-3" />
                            {item.status === "pendente" ? "Pendente" : "Respondido"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelected(item)}
                            className="size-8 rounded-lg border border-gray-200 grid place-items-center text-gray-400 hover:text-primary hover:border-primary transition-colors"
                          >
                            <Eye className="size-4" />
                          </button>
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
    </>
  );
}
