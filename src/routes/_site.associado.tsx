import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  UserPlus,
  LogIn,
  ArrowRight,
  CheckCircle,
  Shield,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  cadastrarAssociado,
  loginAssociado,
} from "@/lib/api/associado";

export const Route = createFileRoute("/_site/associado")({
  component: Associado,
});

function Associado() {
  const navigate = useNavigate();
  const token = localStorage.getItem("associado_token");
  const [aba, setAba] = useState<"cadastro" | "login">("login");

  if (token) {
    navigate({ to: "/associado/painel", replace: true });
  }

  return (
    <>
      <section className="relative bg-[#D62828] py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:32px_32px]" />
        <div className="relative container-page text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-6">
            Associados
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">Área do Associado</h1>
          <p className="mt-3 text-lg text-white/70 max-w-2xl mx-auto">
            Faça parte da nova APA CMCB XII. Sua contribuição fortalece a educação.
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container-page">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-start">
            <div>
              <div className="flex rounded-lg border border-gray-200 p-1 mb-8">
                <button
                  onClick={() => setAba("login")}
                  className={`flex-1 h-10 rounded-md text-sm font-medium transition-colors ${
                    aba === "login" ? "bg-[#D62828] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Entrar
                </button>
                <button
                  onClick={() => setAba("cadastro")}
                  className={`flex-1 h-10 rounded-md text-sm font-medium transition-colors ${
                    aba === "cadastro" ? "bg-[#D62828] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Cadastrar
                </button>
              </div>
              {aba === "login" ? <AssociadoLogin /> : <AssociadoCadastro />}
            </div>
            <div className="mt-12 lg:mt-0">
              <h2 className="text-2xl lg:text-3xl font-bold text-[#D62828] mb-2">Em breve</h2>
              <p className="text-gray-500 mb-8">Tudo que você vai ter como associado</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: LogIn, title: "Painel do Sócio", desc: "Acesso completo às suas contribuições, benefícios e dados cadastrais." },
                  { icon: CheckCircle, title: "PIX e Boletos", desc: "Pague mensalidades com facilidade." },
                  { icon: ArrowRight, title: "Histórico", desc: "Todas as suas contribuições." },
                  { icon: UserPlus, title: "Dados cadastrais", desc: "Mantenha suas informações atualizadas." },
                  { icon: Shield, title: "Benefícios", desc: "Parceiros e vantagens exclusivas." },
                  { icon: LogIn, title: "Comunidade", desc: "Participe das discussões." },
                  { icon: Shield, title: "Segurança", desc: "Dados protegidos pela LGPD." },
                ].map((item) => (
                  <div key={item.title} className="bg-white rounded-xl border border-gray-100 p-5 text-center hover:shadow-md transition-shadow">
                    <div className="size-10 rounded-full bg-[#D62828]/10 mx-auto grid place-items-center">
                      <item.icon className="size-5 text-[#D62828]" />
                    </div>
                    <h3 className="mt-3 font-semibold text-gray-900 text-base">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function AssociadoCadastro() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    const password = data.get("cpf") as string;

    try {
      const res = await cadastrarAssociado({
        nome: data.get("nome") as string,
        cpf: password,
        email: data.get("email") as string,
        telefone: data.get("telefone") as string,
        nome_aluno: (data.get("nome_aluno") as string) || undefined,
        password,
      });

      if (res.success && res.token) {
        localStorage.setItem("associado_token", res.token);
        localStorage.setItem("associado_data", JSON.stringify(res.associado));
        toast.success(res.message);
        window.location.href = "/associado/painel";
      }
    } catch {
      toast.error("Erro ao cadastrar. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-[#D62828] mb-6">Cadastrar</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Nome completo</label>
          <input
            name="nome"
            type="text"
            required
            className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#D62828] transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">CPF</label>
          <input
            name="cpf"
            type="text"
            required
            maxLength={11}
            placeholder="Apenas números"
            className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#D62828] transition-colors"
            onChange={(e) => { e.target.value = e.target.value.replace(/\D/g, ""); }}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#D62828] transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Telefone</label>
          <input
            name="telefone"
            type="text"
            required
            className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#D62828] transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Nome do aluno</label>
          <input
            name="nome_aluno"
            type="text"
            className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#D62828] transition-colors"
          />
        </div>
        <p className="text-xs text-gray-400">Sua senha de acesso será o CPF informado.</p>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 w-full h-11 px-6 rounded-lg bg-[#D62828] text-white font-medium text-sm hover:bg-[#D62828]/90 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
          {loading ? "Cadastrando..." : "Enviar cadastro"}
        </button>
      </form>
    </div>
  );
}

function AssociadoLogin() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await loginAssociado(
        data.get("email") as string,
        data.get("password") as string,
      );

      if (res.success && res.token) {
        localStorage.setItem("associado_token", res.token);
        localStorage.setItem("associado_data", JSON.stringify(res.associado));
        toast.success(res.message);
        window.location.href = "/associado/painel";
      }
    } catch {
      toast.error("E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-[#D62828] mb-6">Entrar</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Email ou CPF</label>
          <input
            name="email"
            type="text"
            required
            className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#D62828] transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Senha</label>
          <input
            name="password"
            type="password"
            required
            className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#D62828] transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 w-full h-11 px-6 rounded-lg bg-[#D62828] text-white font-medium text-sm hover:bg-[#D62828]/90 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <div className="mt-4 text-center">
        <a href="#" className="text-sm text-[#D62828] hover:underline">Esqueceu a senha? Recuperar acesso</a>
      </div>
      <div className="mt-6 pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-400 leading-relaxed text-center">
          <Shield className="size-3 inline mr-1" />
          Dados protegidos pela LGPD.
        </p>
      </div>
    </div>
  );
}
