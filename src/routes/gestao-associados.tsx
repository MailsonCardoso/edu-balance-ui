import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Loader2, Search, GraduationCap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, EmptyState } from "@/components/shared/Primitives";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  fetchAssociados,
  type AssociadoListItem,
} from "@/lib/api/associado";

export const Route = createFileRoute("/gestao-associados")({
  component: GestaoAssociados,
});

function GestaoAssociados() {
  const [q, setQ] = useState("");
  const [alunosDialog, setAlunosDialog] = useState<AssociadoListItem | null>(null);

  const { data: associados = [], isLoading } = useQuery({
    queryKey: ["associados"],
    queryFn: fetchAssociados,
  });

  const filtered = q
    ? associados.filter(
        (a) =>
          a.nome.toLowerCase().includes(q.toLowerCase()) ||
          a.cpf.includes(q) ||
          a.email.toLowerCase().includes(q.toLowerCase()),
      )
    : associados;

  return (
    <>
      <PageHeader
        title="Gestão de Associados"
        description="Visualize e gerencie os associados cadastrados"
      />

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nome, CPF ou email..."
                className="h-10 pl-9"
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {filtered.length} de {associados.length} associados
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Nenhum associado encontrado"
              description={q ? "Tente outro termo de busca." : "Nenhum associado cadastrado ainda."}
              icon={<Users className="size-6" />}
            />
          ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium w-[180px]">Nome</th>
                    <th className="px-4 py-3 font-medium w-[140px]">CPF</th>
                    <th className="px-4 py-3 font-medium w-[200px]">Email</th>
                    <th className="px-4 py-3 font-medium w-[130px]">Telefone</th>
                    <th className="px-4 py-3 font-medium w-[100px]">Aluno</th>
                    <th className="px-4 py-3 font-medium w-[90px]">Status</th>
                    <th className="px-4 py-3 font-medium w-[100px]">Cadastro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium max-w-[180px] truncate" title={a.nome}>{a.nome}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap font-mono text-xs">
                        {a.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate" title={a.email}>{a.email}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{a.telefone}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[100px] truncate">
                        {a.alunos.length === 0 ? (
                          "-"
                        ) : a.alunos.length === 1 ? (
                          <span title={a.alunos[0].nome} className="truncate block">{a.alunos[0].nome}</span>
                        ) : (
                          <button
                            onClick={() => setAlunosDialog(a)}
                            className="text-primary underline-offset-2 hover:underline cursor-pointer"
                          >
                            {a.alunos.length} alunos
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            a.status === "ativo"
                              ? "bg-emerald-50 text-emerald-700"
                              : a.status === "pendente"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{a.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          )}
        </div>
      </div>

      <Dialog open={!!alunosDialog} onOpenChange={(open) => { if (!open) setAlunosDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alunos de {alunosDialog?.nome}</DialogTitle>
            <DialogDescription>
              Alunos vinculados a este associado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {alunosDialog?.alunos.map((al, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                <GraduationCap className="size-5 text-muted-foreground shrink-0" />
                <span className="font-medium">{al.nome}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
