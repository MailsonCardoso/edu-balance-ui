import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, DollarSign, FileText, Download, CheckCircle, Clock, AlertTriangle, HelpCircle, Building2, Package, User, ChevronDown, Users } from "lucide-react";
import { useState } from "react";
import { getTransparencia } from "@/lib/api/transparencia";

export const Route = createFileRoute("/_site/transparencia")({
  component: Transparencia,
});

function fmt(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const statusConfig = {
  concluido: { icon: CheckCircle, label: "Concluído", color: "text-emerald-500", bg: "bg-emerald-50" },
  andamento: { icon: Clock, label: "Em Andamento", color: "text-amber-500", bg: "bg-amber-50" },
  pendente: { icon: AlertTriangle, label: "Pendente", color: "text-red-500", bg: "bg-red-50" },
  aguardando: { icon: HelpCircle, label: "Aguardando", color: "text-gray-400", bg: "bg-gray-50" },
};

const auditSteps = [
  { title: "Levantamento de Passivos", status: "concluido" as keyof typeof statusConfig },
  { title: "Recuperação Documental", status: "concluido" as keyof typeof statusConfig },
  { title: "Inventário Patrimonial", status: "andamento" as keyof typeof statusConfig },
  { title: "Auditoria de Contas", status: "andamento" as keyof typeof statusConfig },
  { title: "Regularização Fiscal", status: "pendente" as keyof typeof statusConfig },
  { title: "Prestação de Contas Final", status: "aguardando" as keyof typeof statusConfig },
];

const documents = [
  { name: "Estatuto Social", updated: "12 Jun 2026" },
  { name: "Atas de Assembleias", updated: "05 Jun 2026" },
  { name: "Regimento Interno", updated: "01 Jun 2026" },
  { name: "Balancete Mensal", updated: "10 Jun 2026" },
  { name: "CNPJ", updated: "15 Mai 2026" },
  { name: "Certidões Negativas", updated: "08 Jun 2026" },
];

const faq = [
  { q: "Como é feita a prestação de contas?", a: "A prestação de contas é realizada mensalmente através de balancetes detalhados, disponíveis para consulta de todos os associados. Os documentos são auditados e publicados no Portal da Transparência." },
  { q: "Quem pode fiscalizar as contas?", a: "Todos os associados em dia com suas contribuições têm direito a fiscalizar as contas da associação, conforme previsto no estatuto social." },
  { q: "Como são aplicados os recursos?", a: "Os recursos são aplicados exclusivamente em benefício dos alunos e da comunidade escolar, incluindo apoio educacional, projetos sociais, cultura, esporte e melhorias na infraestrutura." },
  { q: "Quando acontecem as assembleias?", a: "As assembleias gerais ordinárias acontecem trimestralmente. Assembleias extraordinárias podem ser convocadas sempre que necessário, mediante edital publicado com antecedência mínima de 8 dias." },
];

const management = [
  { name: "João Silva", role: "Presidente", desc: "Responsável pela coordenação geral e representação institucional da APA." },
  { name: "Maria Oliveira", role: "Vice-Presidente", desc: "Auxilia na coordenação e substitui o presidente em suas ausências." },
  { name: "Carlos Santos", role: "Secretário", desc: "Responsável pelas atas, documentação e comunicação oficial." },
  { name: "Ana Costa", role: "Tesoureira", desc: "Responsável pela gestão financeira, contas e prestação de contas." },
];

function Transparencia() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["transparencia"],
    queryFn: getTransparencia,
    refetchInterval: 60_000,
  });

  return (
    <>
      <section className="relative bg-[#D62828] py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:32px_32px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-6">
            Transparência
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">Portal da Transparência</h1>
          <p className="mt-3 text-lg text-white/70 max-w-2xl mx-auto">
            "Nossas contas estão nas suas mãos."
          </p>
        </div>
      </section>

      <section className="relative -mt-10 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-lg bg-emerald-50 grid place-items-center text-emerald-600">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{data ? fmt(data.financeiro.receitas_mes) : "—"}</p>
                <p className="text-xs text-gray-500">Arrecadação do Mês</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-lg bg-blue-50 grid place-items-center text-blue-600">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{data ? String(data.total_associados) : "—"}</p>
                <p className="text-xs text-gray-500">Total de Associados</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-lg bg-amber-50 grid place-items-center text-amber-600">
                <Clock className="size-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">2</p>
                <p className="text-xs text-gray-500">Projetos em Andamento</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-lg bg-purple-50 grid place-items-center text-purple-600">
                <FileText className="size-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">2024/2025</p>
                <p className="text-xs text-gray-500">Prestação de Contas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
              <p className="text-2xl font-bold text-[#D62828]">{data ? fmt(data.financeiro.total_pago) : "—"}</p>
              <p className="text-xs text-gray-500 mt-1">Total Arrecadado (histórico)</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
              <p className="text-2xl font-bold text-[#D62828]">{data ? fmt(data.financeiro.receitas_ano) : "—"}</p>
              <p className="text-xs text-gray-500 mt-1">Receitas do Ano</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
              <p className="text-2xl font-bold text-emerald-600">{data ? String(data.mensalidades.pagas) + "/" + String(data.mensalidades.total) : "—"}</p>
              <p className="text-xs text-gray-500 mt-1">Mensalidades Pagas</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
              <p className="text-2xl font-bold text-amber-600">{data ? String(data.alunos.em_dia) + "/" + String(data.alunos.ativos) : "—"}</p>
              <p className="text-xs text-gray-500 mt-1">Alunos em Dia</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-[#D62828] mb-6">Auditoria e Regularização</h2>
              <p className="text-sm text-gray-500 mb-8">
                Acompanhe o status do processo de auditoria e regularização institucional.
              </p>
              <div className="space-y-3">
                {auditSteps.map((step) => {
                  const cfg = statusConfig[step.status];
                  const Icon = cfg.icon;
                  return (
                    <div key={step.title} className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className={`size-8 rounded-full ${cfg.bg} grid place-items-center ${cfg.color}`}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{step.title}</p>
                      </div>
                      <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#D62828] mb-6">Documentos</h2>
              <p className="text-sm text-gray-500 mb-8">
                Documentos institucionais disponíveis para consulta e download.
              </p>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.name} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="size-5 text-red-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                        <p className="text-xs text-gray-400">Atualizado em {doc.updated}</p>
                      </div>
                    </div>
                    <button className="shrink-0 size-8 rounded-lg bg-gray-50 grid place-items-center text-gray-400 hover:text-[#D62828] hover:bg-[#D62828]/5 transition-colors opacity-0 group-hover:opacity-100">
                      <Download className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#D62828]">Gestão Atual</h2>
            <p className="text-gray-500 mt-1">Diretoria Provisória — Mandato de 90 dias para regularização</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {management.map((person) => (
              <div key={person.name} className="bg-white rounded-xl border border-gray-100 p-6 text-center hover:shadow-md transition-shadow">
                <div className="size-16 rounded-full bg-gradient-to-br from-[#D62828]/10 to-gray-100 mx-auto grid place-items-center">
                  <User className="size-7 text-[#D62828]/40" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{person.name}</h3>
                <p className="text-xs font-medium text-[#D62828] uppercase tracking-wider mt-0.5">{person.role}</p>
                <p className="text-xs text-gray-500 mt-2">{person.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-lg bg-amber-50 border border-amber-200 text-center">
            <p className="text-sm text-amber-800">
              Mandato provisório de 90 dias para regularização e realização de eleições diretas.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#D62828]">Perguntas Frequentes</h2>
          </div>
          <div className="space-y-2">
            {faq.map((item, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">{item.q}</span>
                  <ChevronDown className={`size-4 text-gray-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
