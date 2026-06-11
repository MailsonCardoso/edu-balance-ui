import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Shield, Lock, MessageSquare, CheckCircle, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { enviarManifestacao } from "@/lib/api/ouvidoria";

export const Route = createFileRoute("/_site/ouvidoria")({
  component: Ouvidoria,
});

function Ouvidoria() {
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [protocolo, setProtocolo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await enviarManifestacao({
        nome: data.get("nome") as string,
        email: data.get("email") as string,
        tipo: data.get("tipo") as string,
        mensagem: data.get("mensagem") as string,
        anonimo: anonymous,
      });

      setProtocolo(res.protocolo);
      setSubmitted(true);
      toast.success(res.message);
    } catch {
      toast.error("Erro ao enviar manifestação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const copiarProtocolo = () => {
    navigator.clipboard.writeText(protocolo);
    toast.success("Protocolo copiado!");
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="size-16 rounded-full bg-emerald-50 mx-auto grid place-items-center">
            <CheckCircle className="size-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#D62828] mt-6">Manifestação enviada</h2>
          <p className="text-gray-500 mt-2">
            {anonymous
              ? "Sua manifestação foi registrada de forma anônima."
              : "Você receberá uma resposta no e-mail informado."}
          </p>

          <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 uppercase tracking-wider font-medium mb-2">
              Protocolo
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-bold text-[#D62828] font-mono">{protocolo}</span>
              <button
                onClick={copiarProtocolo}
                className="size-9 rounded-lg border border-gray-200 grid place-items-center text-gray-400 hover:text-[#D62828] hover:border-[#D62828] transition-colors"
              >
                <Copy className="size-4" />
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-400 mt-4">
            Guarde este protocolo para acompanhar sua manifestação.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="relative bg-[#D62828] py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:32px_32px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-6">
            Canal Sigiloso
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">Ouvidoria</h1>
          <p className="mt-3 text-lg text-white/70 max-w-2xl mx-auto">
            Canal de comunicação direta, sigiloso e seguro para sugestões, elogios, reclamações e denúncias.
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-[#D62828] mb-6">Envie sua manifestação</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Nome</label>
                      <input
                        name="nome"
                        type="text"
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#D62828] transition-colors"
                        disabled={anonymous}
                        placeholder={anonymous ? "Anônimo" : "Seu nome"}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">E-mail</label>
                      <input
                        name="email"
                        type="email"
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#D62828] transition-colors"
                        disabled={anonymous}
                        placeholder={anonymous ? "Anônimo" : "seu@email.com"}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Tipo</label>
                    <select
                      name="tipo"
                      className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#D62828] transition-colors bg-white"
                      required
                    >
                      <option value="">Selecione...</option>
                      <option value="sugestao">Sugestão</option>
                      <option value="reclamacao">Reclamação</option>
                      <option value="denuncia">Denúncia</option>
                      <option value="elogio">Elogio</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Mensagem</label>
                    <textarea
                      name="mensagem"
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#D62828] transition-colors resize-none"
                      placeholder="Descreva sua manifestação em detalhes..."
                      required
                      minLength={10}
                    />
                  </div>

                  <label className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={anonymous}
                      onChange={(e) => setAnonymous(e.target.checked)}
                      className="size-4 rounded border-gray-300 text-[#D62828] focus:ring-[#D62828]"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Desejo manter anonimato</span>
                      <p className="text-xs text-gray-400">Seus dados não serão identificados</p>
                    </div>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-white text-[#D62828] border border-[#D62828] font-medium text-sm hover:bg-[#D62828]/5 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    {loading ? "Enviando..." : "Enviar Manifestação"}
                  </button>
                </form>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
                <Lock className="size-6 text-[#D62828] mb-3" />
                <h3 className="text-base font-semibold text-gray-900">Sigilo Garantido</h3>
                <p className="text-sm text-gray-500 mt-1">Suas informações são protegidas e tratadas com absoluto sigilo.</p>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
                <MessageSquare className="size-6 text-[#D62828] mb-3" />
                <h3 className="text-base font-semibold text-gray-900">Canal Direto</h3>
                <p className="text-sm text-gray-500 mt-1">Sua manifestação chega diretamente à ouvidoria da associação.</p>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
                <Shield className="size-6 text-[#D62828] mb-3" />
                <h3 className="text-base font-semibold text-gray-900">Denúncia Anônima</h3>
                <p className="text-sm text-gray-500 mt-1">Caso prefira, marque a opção anônima e seus dados não serão identificados.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
