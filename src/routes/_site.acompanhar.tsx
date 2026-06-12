import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Clock, Play, CheckCircle, MessageCircle, FileText } from "lucide-react";
import { acompanharProtocolo, type AcompanharResponse } from "@/lib/api/ouvidoria";

export const Route = createFileRoute("/_site/acompanhar")({
  component: Acompanhar,
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

const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string; description: string }> = {
  pendente: {
    icon: Clock,
    color: "text-amber-600 bg-amber-50",
    label: "Pendente",
    description: "Sua manifestação foi registrada e aguarda atendimento.",
  },
  em_andamento: {
    icon: Play,
    color: "text-blue-600 bg-blue-50",
    label: "Em Andamento",
    description: "Sua manifestação está sendo analisada pela equipe.",
  },
  respondido: {
    icon: CheckCircle,
    color: "text-emerald-600 bg-emerald-50",
    label: "Respondido",
    description: "Sua manifestação foi respondida.",
  },
};

function Acompanhar() {
  const [protocolo, setProtocolo] = useState("");
  const [resultado, setResultado] = useState<AcompanharResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocolo.trim()) return;

    setLoading(true);
    setError("");
    setResultado(null);

    try {
      const data = await acompanharProtocolo(protocolo.trim());
      setResultado(data);
    } catch {
      setError("Protocolo não encontrado. Verifique o número e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="relative bg-primary py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:32px_32px]" />
        <div className="relative container-page text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-6">
            Acompanhamento
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">Consultar Protocolo</h1>
          <p className="mt-3 text-lg text-white/70 max-w-2xl mx-auto">
            Acompanhe o status da sua manifestação na ouvidoria.
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Digite seu protocolo (ex: OUV-2026-0001)"
                  value={protocolo}
                  onChange={(e) => setProtocolo(e.target.value.toUpperCase())}
                  className="w-full h-12 pl-10 pr-4 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !protocolo.trim()}
                className="h-12 px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Buscando..." : "Consultar"}
              </button>
            </div>
          </form>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {resultado && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Protocolo</p>
                    <p className="text-lg font-mono font-bold text-primary">{resultado.protocolo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Data</p>
                    <p className="text-sm text-gray-900">{resultado.created_at}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Tipo</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${tipoColor[resultado.tipo] || "text-gray-600 bg-gray-50"}`}>
                      <MessageCircle className="size-3" />
                      {tipoLabel[resultado.tipo] || resultado.tipo}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Status</p>
                    {(() => {
                      const config = statusConfig[resultado.status] || statusConfig.pendente;
                      const StatusIcon = config.icon;
                      return (
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${config.color}`}>
                          <StatusIcon className="size-3" />
                          {config.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-start gap-3">
                  {(() => {
                    const config = statusConfig[resultado.status] || statusConfig.pendente;
                    return (
                      <>
                        <div className={`size-10 rounded-lg grid place-items-center ${config.color}`}>
                          <config.icon className="size-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">{config.label}</h3>
                          <p className="text-sm text-gray-500 mt-1">{config.description}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-4 flex items-center gap-2">
                  <FileText className="size-4" />
                  Sua Mensagem
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{resultado.mensagem}</p>
              </div>

              {resultado.descricao && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-4 flex items-center gap-2">
                    <MessageCircle className="size-4" />
                    Resposta da Ouvidoria
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{resultado.descricao}</p>
                </div>
              )}
            </div>
          )}

          {!resultado && !error && (
            <div className="text-center py-12">
              <div className="size-16 rounded-full bg-gray-50 mx-auto grid place-items-center mb-4">
                <Search className="size-8 text-gray-300" />
              </div>
              <p className="text-sm text-gray-500">
                Digite seu protocolo para acompanhar o andamento da sua manifestação.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
