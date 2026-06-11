import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Shield, Lock, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/site/ouvidoria")({
  component: Ouvidoria,
});

function Ouvidoria() {
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Manifestação enviada com sucesso!");
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="size-16 rounded-full bg-emerald-50 mx-auto grid place-items-center">
            <Shield className="size-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#0B2B4F] mt-6">Manifestação enviada</h2>
          <p className="text-gray-500 mt-2">
            Sua manifestação foi registrada com sucesso. {anonymous ? "Por ser anônima, não será possível acompanhar individualmente." : "Você receberá uma resposta no e-mail informado."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="relative bg-[#0B2B4F] py-16 lg:py-24 overflow-hidden">
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

      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-[#0B2B4F] mb-6">Envie sua manifestação</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Nome</label>
                      <input
                        type="text"
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#0B2B4F] transition-colors"
                        disabled={anonymous}
                        placeholder={anonymous ? "Anônimo" : "Seu nome"}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">E-mail</label>
                      <input
                        type="email"
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#0B2B4F] transition-colors"
                        disabled={anonymous}
                        placeholder={anonymous ? "Anônimo" : "seu@email.com"}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Tipo</label>
                    <select className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#0B2B4F] transition-colors bg-white">
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
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#0B2B4F] transition-colors resize-none"
                      placeholder="Descreva sua manifestação em detalhes..."
                      required
                    />
                  </div>

                  <label className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={anonymous}
                      onChange={(e) => setAnonymous(e.target.checked)}
                      className="size-4 rounded border-gray-300 text-[#0B2B4F] focus:ring-[#0B2B4F]"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Desejo manter anonimato</span>
                      <p className="text-xs text-gray-400">Seus dados não serão identificados</p>
                    </div>
                  </label>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-[#0B2B4F] text-white font-medium text-sm hover:bg-[#0B2B4F]/90 transition-colors"
                  >
                    <Send className="size-4" /> Enviar Manifestação
                  </button>
                </form>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
                <Lock className="size-6 text-[#0B2B4F] mb-3" />
                <h3 className="text-sm font-semibold text-gray-900">Sigilo Garantido</h3>
                <p className="text-xs text-gray-500 mt-1">Suas informações são protegidas e tratadas com absoluto sigilo.</p>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
                <MessageSquare className="size-6 text-[#0B2B4F] mb-3" />
                <h3 className="text-sm font-semibold text-gray-900">Canal Direto</h3>
                <p className="text-xs text-gray-500 mt-1">Sua manifestação chega diretamente à ouvidoria da associação.</p>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
                <Shield className="size-6 text-[#0B2B4F] mb-3" />
                <h3 className="text-sm font-semibold text-gray-900">Denúncia Anônima</h3>
                <p className="text-xs text-gray-500 mt-1">Caso prefira, marque a opção anônima e seus dados não serão identificados.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
