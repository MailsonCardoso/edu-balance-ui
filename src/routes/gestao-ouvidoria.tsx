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
  Play,
  Send,
} from "lucide-react";
import { PageHeader } from "@/components/shared/Primitives";
import { OuvidoriaSheet } from "@/components/shared/OuvidoriaSheet";
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
  const [sheetItem, setSheetItem] = useState<OuvidoriaListItem | null>(null);

  const queryClient = useQueryClient();

  const { data: manifestacoes = [], isLoading } = useQuery({
    queryKey: ["ouvidoria"],
    queryFn: listarManifestacoes,
  });

  const mutation = useMutation({
    mutationFn: ({
      id,
      status,
      descricao,
    }: {
      id: number;
      status: "em_andamento" | "respondido";
      descricao?: string;
    }) => atualizarStatus(id, { status, descricao }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ouvidoria"] });
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

  return (
    <>
      <PageHeader title="Ouvidoria" description="Manifestações recebidas" />

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por protocolo ou mensagem..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring transition-colors"
            />
          </div>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring transition-colors"
          >
            <option value="">Todos os tipos</option>
            {Object.entries(tipoLabel).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring transition-colors"
          >
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="respondido">Respondido</option>
          </select>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
              Carregando...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-sm text-muted-foreground">
              <MessageCircle className="size-8 mb-2 opacity-50" />
              Nenhuma manifestação encontrada
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Protocolo</th>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Autor</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="w-12 px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((item) => {
                    const StatusIcon = statusIcon[item.status] || Clock;
                    const statusCls =
                      statusColor[item.status] || "text-gray-600 bg-gray-50";
                    const tipoCls =
                      tipoColor[item.tipo] || "text-gray-600 bg-gray-50";
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-xs font-medium">
                          {item.protocolo}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${tipoCls}`}
                          >
                            <MessageCircle className="size-3" />
                            {tipoLabel[item.tipo] || item.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.anonimo ? (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Shield className="size-3" /> Anônimo
                            </span>
                          ) : (
                            <span className="text-sm">{item.nome}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {item.created_at}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusCls}`}
                          >
                            <StatusIcon className="size-3" />
                            {statusLabel[item.status] || item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSheetItem(item)}
                              className="p-1.5 rounded hover:bg-accent"
                              title="Visualizar"
                            >
                              <Eye className="size-4" />
                            </button>
                            {item.status === "pendente" && (
                              <button
                                onClick={() =>
                                  mutation.mutate({
                                    id: item.id,
                                    status: "em_andamento",
                                  })
                                }
                                disabled={mutation.isPending}
                                className="p-1.5 rounded hover:bg-blue-50 text-blue-600 disabled:opacity-50"
                                title="Iniciar Atendimento"
                              >
                                <Play className="size-4" />
                              </button>
                            )}
                            {item.status === "em_andamento" && (
                              <button
                                onClick={() => setSheetItem(item)}
                                className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600"
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

      <OuvidoriaSheet
        open={!!sheetItem}
        onOpenChange={(open) => {
          if (!open) setSheetItem(null);
        }}
        item={sheetItem}
        onStartAtendimento={(id, descricao) =>
          mutation.mutate({ id, status: "em_andamento", descricao })
        }
        onResponder={(id, descricao) =>
          mutation.mutate({ id, status: "respondido", descricao })
        }
        isPending={mutation.isPending}
      />
    </>
  );
}
