import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  MessageCircle,
  Eye,
  Search,
  Shield,
  CheckCircle,
  Clock,
  X,
  Play,
  Send,
} from "lucide-react";
import { PageHeader } from "@/components/shared/Primitives";
import {
  listarManifestacoes,
  atualizarStatus,
  type OuvidoriaListItem,
} from "@/lib/api/ouvidoria";

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
  em_andamento: Play,
  respondido: CheckCircle,
};

const statusColor: Record<string, string> = {
  pendente: "text-amber-600 bg-amber-50",
  em_andamento: "text-blue-600 bg-blue-50",
  respondido: "text-emerald-600 bg-emerald-50",
};

const statusLabel: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  respondido: "Respondido",
};

function GestaoOuvidoria() {
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [selected, setSelected] = useState<OuvidoriaListItem | null>(null);
  const [inicioModal, setInicioModal] = useState<OuvidoriaListItem | null>(null);
  const [respostaModal, setRespostaModal] = useState<OuvidoriaListItem | null>(null);
  const [descricao, setDescricao] = useState("");

  const queryClient = useQueryClient();

  const { data: manifestacoes = [], isLoading } = useQuery({
    queryKey: ["ouvidoria"],
    queryFn: listarManifestacoes,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status, descricao }: { id: number; status: "em_andamento" | "respondido"; descricao?: string }) =>
      atualizarStatus(id, { status, descricao }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ouvidoria"] });
      setInicioModal(null);
      setRespostaModal(null);
      setDescricao("");
      setSelected(null);
    },
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
                    {statusLabel[selected.status] || selected.status}
                  </span>
                </div>
              </div>

              {selected.status === "pendente" && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setInicioModal(selected)}
                    disabled={mutation.isPending}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Play className="size-4" />
                    Iniciar Atendimento
                  </button>
                </div>
              )}

              {selected.status === "em_andamento" && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setRespostaModal(selected)}
                    disabled={mutation.isPending}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <Send className="size-4" />
                    Registrar Resposta
                  </button>
                </div>
              )}
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

            {selected.descricao && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-4">Resposta/Descrição</h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.descricao}</p>
              </div>
            )}
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
            <option value="em_andamento">Em Andamento</option>
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
                            {statusLabel[item.status] || item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelected(item)}
                              className="size-8 rounded-lg border border-gray-200 grid place-items-center text-gray-400 hover:text-primary hover:border-primary transition-colors"
                            >
                              <Eye className="size-4" />
                            </button>
                            {item.status === "pendente" && (
                              <button
                                onClick={() => setInicioModal(item)}
                                disabled={mutation.isPending}
                                className="size-8 rounded-lg border border-blue-200 grid place-items-center text-blue-500 hover:text-blue-700 hover:border-blue-400 transition-colors disabled:opacity-50"
                                title="Iniciar Atendimento"
                              >
                                <Play className="size-4" />
                              </button>
                            )}
                            {item.status === "em_andamento" && (
                              <button
                                onClick={() => setRespostaModal(item)}
                                disabled={mutation.isPending}
                                className="size-8 rounded-lg border border-emerald-200 grid place-items-center text-emerald-500 hover:text-emerald-700 hover:border-emerald-400 transition-colors disabled:opacity-50"
                                title="Registrar Resposta"
                              >
                                <Send className="size-4" />
                              </button>
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

      {inicioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Iniciar Atendimento</h3>
              <button
                onClick={() => {
                  setInicioModal(null);
                  setDescricao("");
                }}
                className="size-8 rounded-lg grid place-items-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Protocolo</p>
              <p className="text-sm font-mono font-semibold text-gray-900">{inicioModal.protocolo}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem Original</label>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                {inicioModal.mensagem}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição (opcional)</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
                placeholder="Adicione uma observação sobre o atendimento..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setInicioModal(null);
                  setDescricao("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  mutation.mutate({
                    id: inicioModal.id,
                    status: "em_andamento",
                    descricao: descricao.trim() || undefined,
                  });
                }}
                disabled={mutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Play className="size-4" />
                {mutation.isPending ? "Iniciando..." : "Iniciar Atendimento"}
              </button>
            </div>
          </div>
        </div>
      )}

      {respostaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Registrar Resposta</h3>
              <button
                onClick={() => {
                  setRespostaModal(null);
                  setDescricao("");
                }}
                className="size-8 rounded-lg grid place-items-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Protocolo</p>
              <p className="text-sm font-mono font-semibold text-gray-900">{respostaModal.protocolo}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem Original</label>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                {respostaModal.mensagem}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sua Resposta *</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={4}
                placeholder="Digite a resposta ao cidadão..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setRespostaModal(null);
                  setDescricao("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (descricao.trim()) {
                    mutation.mutate({
                      id: respostaModal.id,
                      status: "respondido",
                      descricao: descricao.trim(),
                    });
                  }
                }}
                disabled={!descricao.trim() || mutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <Send className="size-4" />
                {mutation.isPending ? "Enviando..." : "Enviar Resposta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
