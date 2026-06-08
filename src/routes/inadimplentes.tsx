import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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

export const Route = createFileRoute("/inadimplentes")({
  component: Inadimplentes,
});

function Inadimplentes() {
  const [turma, setTurma] = useState("all");
  const [minValor, setMinValor] = useState(0);

  const list = useMemo(() => {
    return [] as Array<Record<string, unknown>>;
  }, [turma, minValor]);

  return (
    <>
      <PageHeader
        title="Inadimplentes"
        description={`${list.length} aluno(s) com parcelas em aberto`}
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
          {list.length === 0 ? (
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
                {list.map((r) => (
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
