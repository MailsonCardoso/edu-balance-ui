import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowRight, Users, DollarSign, FolderOpen, FileText, CheckCircle, AlertTriangle, Building2, Target, Eye, Heart, GraduationCap, Shield, Handshake } from "lucide-react";

export const Route = createFileRoute("/_site/")({
  component: SiteHome,
});

const slides = [
  {
    title: "Bem-vindos à nova gestão da APA CMCB XII",
    subtitle: "Transparência e Compromisso com a educação dos nossos filhos",
  },
  {
    title: "Prestação de Contas em Tempo Real",
    subtitle: "Acompanhe nosso trabalho e fiscalize cada recurso aplicado",
  },
  {
    title: "Próxima Assembleia Geral",
    subtitle: "Participe das decisões e fortaleça nossa associação",
  },
];

const indicators = [
  { icon: Users, label: "Total de Associados", value: "487", color: "text-blue-600" },
  { icon: DollarSign, label: "Arrecadação do Mês", value: "R$ 24.580", color: "text-emerald-600" },
  { icon: FolderOpen, label: "Projetos em Andamento", value: "6", color: "text-amber-600" },
  { icon: FileText, label: "Prestações de Contas", value: "12", color: "text-purple-600" },
];

const news = [
  {
    title: "Nova diretoria toma posse e inicia processo de regularização",
    summary: "A nova gestão da APA CMCB XII iniciou os trabalhos com foco em transparência, reconstrução institucional e regularização documental.",
    date: "10 Jun 2026",
    image: null,
    category: "Comunicados",
  },
  {
    title: "Prestação de contas do primeiro trimestre disponível",
    summary: "Balancete referente ao período de janeiro a março já está disponível no Portal da Transparência para consulta dos associados.",
    date: "05 Jun 2026",
    image: null,
    category: "Transparência",
  },
  {
    title: "Assembleia Geral convocada para o dia 30 de julho",
    summary: "Edital de convocação foi publicado. Pauta inclui eleição da diretoria definitiva e aprovação do estatuto.",
    date: "01 Jun 2026",
    image: null,
    category: "Eventos",
    },
  {
    title: "Campanha de regularização de associados",
    summary: "Associados com contribuições pendentes podem regularizar sua situação com condições especiais até o fim do mês.",
    date: "28 Mai 2026",
    image: null,
    category: "Comunicados",
  },
];

function SiteHome() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((s) => (s + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <section className="relative bg-[#0B2B4F] min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:32px_32px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B2B4F] via-[#0B2B4F]/95 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-6">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              APA CMCB XII — Nova Gestão
            </div>

            <div className="relative overflow-hidden min-h-[180px]">
              {slides.map((slide, i) => (
                <div
                  key={i}
                  className={`transition-all duration-700 ${
                    i === currentSlide ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 absolute inset-0"
                  }`}
                >
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                    {slide.title}
                  </h1>
                  <p className="mt-4 text-lg text-white/70 max-w-lg">
                    {slide.subtitle}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                to="/transparencia"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-emerald-500 text-white font-medium text-sm hover:bg-emerald-600 transition-colors"
              >
                Portal da Transparência <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/transparencia"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-colors border border-white/20"
              >
                Seja Sócio
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-colors border border-white/20"
              >
                Dashboard
              </Link>
            </div>

            <div className="flex items-center gap-2 mt-8">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentSlide ? "w-8 bg-emerald-400" : "w-2 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-10 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {indicators.map((item) => (
            <div key={item.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`size-10 rounded-lg bg-gray-50 grid place-items-center ${item.color}`}>
                  <item.icon className="size-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{item.value}</p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-[#0B2B4F]">Últimas Notícias</h2>
              <p className="text-gray-500 mt-1">Acompanhe as novidades da associação</p>
            </div>
            <Link
              to="/noticias"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[#0B2B4F] hover:underline"
            >
              Ver todas <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {news.map((item) => (
              <div key={item.title} className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-gradient-to-br from-[#0B2B4F]/5 to-gray-100 flex items-center justify-center">
                  <FileText className="size-10 text-[#0B2B4F]/20" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-[#0B2B4F] bg-[#0B2B4F]/5 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-400">{item.date}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-[#0B2B4F] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{item.summary}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link
              to="/noticias"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#0B2B4F]"
            >
              Ver todas <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-gradient-to-br from-[#0B2B4F] to-[#0B2B4F]/95 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold">
            Ainda não é sócio?
          </h2>
          <p className="mt-4 text-white/70 max-w-2xl mx-auto text-lg">
            Regularize sua situação e fortaleça a educação do seu filho. Sua participação faz a diferença.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link
              to="/transparencia"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
            >
              Quero ser Sócio <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/transparencia"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors border border-white/20"
            >
              Portal da Transparência
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
