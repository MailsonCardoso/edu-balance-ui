import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/shared/Primitives";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { turmas } from "@/lib/mock-data";
import { brl } from "@/lib/format";
import { fetchMensalidades } from "@/lib/api/mensalidades";
import { fetchAlunos } from "@/lib/api/alunos";
import { toast } from "sonner";

export const Route = createFileRoute("/inadimplentes")({
  component: Inadimplentes,
});

function Inadimplentes() {
  const [turma, setTurma] = useState("all");
  const [minValor, setMinValor] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lista, setLista] = useState<
    { id: string; nome: string; turma: string; parcelas: number; maiorAtraso: number; total: number }[]
  >([]);

  useEffect(() => {
    Promise.all([fetchAlunos(), fetchMensalidades()])
      .then(([alunos, mensalidades]) => {
        const hoje = new Date();
        const agrupado = new Map<
          string,
          { nome: string; turma: string; parcelas: number; maiorAtraso: number; total: number }
        >();

        const pendentes = mensalidades.filter((m) => m.status === "pendente" || m.status === "atrasado");
        for (const m of pendentes) {
          const aluno = alunos.find((a) => a.id === m.alunoId);
          if (!aluno) continue;
          if (turma !== "all" && aluno.turma !== turma) continue;

          const venc = new Date(m.dataVencimento.split("/").reverse().join("-"));
          const atraso = Math.max(0, Math.floor((hoje.getTime() - venc.getTime()) / (1000 * 60 * 60 * 24)));

          const existente = agrupado.get(m.alunoId);
          if (existente) {
            existente.parcelas += 1;
            existente.total += m.valor;
            if (atraso > existente.maiorAtraso) existente.maiorAtraso = atraso;
          } else {
            agrupado.set(m.alunoId, {
              id: m.alunoId,
              nome: aluno.nome,
              turma: aluno.turma,
              parcelas: 1,
              maiorAtraso: atraso,
              total: m.valor,
            });
          }
        }

        const arr = Array.from(agrupado.values()).filter((r) => r.total >= minValor);
        arr.sort((a, b) => b.maiorAtraso - a.maiorAtraso);
        setLista(arr);
      })
      .catch(() => toast.error("Erro ao carregar dados"))
      .finally(() => setLoading(false));
  }, [turma, minValor]);

  return (
    <>
      <PageHeader
        title="Inadimplentes"
        description={`${lista.length} aluno(s) com parcelas em aberto`}
      />

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 flex flex-col md:flex-row gap-3 border-b border-border">
          <Select value={turma} onValueChange={setTurma}>
            <SelectTrigger className="w-44 h-10">
              <SelectValue placeholder="Todas as turmas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as turmas</SelectItem>
              {turmas.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={minValor || ""}
            onChange={(e) => setMinValor(Number(e.target.value) || 0)}
            placeholder="Valor mínimo (R$)"
            className="h-10 max-w-44"
          />
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : lista.length === 0 ? (
            <EmptyState title="Nenhum inadimplente" description="Ótima notícia!" />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Aluno</th>
                  <th className="px-4 py-3 font-medium">Turma</th>
                  <th className="px-4 py-3 font-medium text-center">Parcelas em atraso</th>
                  <th className="px-4 py-3 font-medium text-center">Dias em atraso</th>
                  <th className="px-4 py-3 font-medium text-right">Valor total devido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lista.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{r.nome}</td>
                    <td className="px-4 py-3">{r.turma}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center min-w-8 h-7 px-2 rounded-full bg-destructive/15 text-destructive text-xs font-semibold">
                        {r.parcelas}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-destructive font-medium">
                      {r.maiorAtraso}d
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-destructive">
                      {brl(r.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
