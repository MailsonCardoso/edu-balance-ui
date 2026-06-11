import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, FileText, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_site/noticias")({
  component: Noticias,
});

const categories = ["Todas", "Comunicados", "Eventos", "Transparência", "Projetos", "Homenagens"];

const allNews = [
  { title: "Nova diretoria toma posse e inicia processo de regularização", summary: "A nova gestão da APA CMCB XII iniciou os trabalhos com foco em transparência, reconstrução institucional e regularização documental de todos os processos.", date: "10 Jun 2026", category: "Comunicados", image: null },
  { title: "Prestação de contas do primeiro trimestre disponível", summary: "Balancete referente ao período de janeiro a março já está disponível no Portal da Transparência para consulta e download dos associados.", date: "05 Jun 2026", category: "Transparência", image: null },
  { title: "Assembleia Geral convocada para o dia 30 de julho", summary: "Edital de convocação foi publicado com antecedência. Pauta inclui eleição da diretoria definitiva e aprovação do novo estatuto.", date: "01 Jun 2026", category: "Eventos", image: null },
  { title: "Campanha de regularização de associados", summary: "Associados com pendências podem regularizar sua situação com condições especiais até o fim do mês. Procure a secretaria da APA.", date: "28 Mai 2026", category: "Comunicados", image: null },
  { title: "Projeto de apoio pedagógico é aprovado", summary: "Novo projeto de reforço escolar será implementado a partir do segundo semestre, beneficiando alunos com dificuldades de aprendizagem.", date: "20 Mai 2026", category: "Projetos", image: null },
  { title: "Homenagem aos professores pelo seu dia", summary: "A APA presta homenagem a todos os professores pelo seu dia, reconhecendo o trabalho essencial na formação dos nossos alunos.", date: "15 Mai 2026", category: "Homenagens", image: null },
  { title: "Oficina de música abre inscrições", summary: "Estão abertas as inscrições para a oficina de música da APA. Vagas limitadas para alunos do 6º ao 9º ano.", date: "10 Mai 2026", category: "Projetos", image: null },
  { title: "Resultados da pesquisa de satisfação", summary: "Pesquisa realizada com os associados aponta alto grau de satisfação com as novas medidas de transparência adotadas pela gestão.", date: "05 Mai 2026", category: "Comunicados", image: null },
  { title: "Festival de talentos da APA", summary: "Inscrições abertas para o festival de talentos. Alunos podem se inscrever nas categorias música, dança, teatro e artes visuais.", date: "28 Abr 2026", category: "Eventos", image: null },
  { title: "Parceria com universidade local", summary: "Nova parceria firmada com universidade local para oferecer estágios e projetos de extensão aos alunos do CMCB XII.", date: "20 Abr 2026", category: "Projetos", image: null },
  { title: "Relatório de auditoria é concluído", summary: "Auditoria independente concluiu os trabalhos. Relatório completo está disponível para consulta dos associados.", date: "15 Abr 2026", category: "Transparência", image: null },
  { title: "Doação de livros para biblioteca", summary: "Campanha de doação de livros arrecadou mais de 200 exemplares que serão incorporados ao acervo da biblioteca escolar.", date: "10 Abr 2026", category: "Projetos", image: null },
];

const ITEMS_PER_PAGE = 6;

function Noticias() {
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = allNews.filter((n) => {
    const matchCategory = activeCategory === "Todas" || n.category === activeCategory;
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.summary.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <>
      <section className="relative bg-[#D62828] py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:32px_32px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-6">
            Notícias
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">Últimas Notícias</h1>
          <p className="mt-3 text-lg text-white/70 max-w-2xl mx-auto">
            Acompanhe as novidades, comunicados e eventos da APA CMCB XII.
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeCategory === cat ? "bg-[#D62828] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar notícias..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#D62828] transition-colors"
              />
            </div>
          </div>

          {paginated.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="size-12 text-gray-200 mx-auto" />
              <p className="mt-4 text-gray-400">Nenhuma notícia encontrada.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map((item) => (
                <div key={item.title} className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-40 bg-gradient-to-br from-[#D62828]/5 to-gray-100 flex items-center justify-center">
                    <FileText className="size-10 text-[#D62828]/20" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-[#D62828] bg-[#D62828]/5 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    <span className="text-sm text-gray-400">{item.date}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-[#D62828] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{item.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="size-9 rounded-lg border border-gray-200 grid place-items-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`size-9 rounded-lg text-sm font-medium transition-colors ${
                    p === page ? "bg-[#D62828] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="size-9 rounded-lg border border-gray-200 grid place-items-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
