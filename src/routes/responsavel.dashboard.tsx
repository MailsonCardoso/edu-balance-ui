import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, LogOut, User, GraduationCap, AlertTriangle, CheckCircle2, Clock, DollarSign } from "lucide-react";
import { StatusBadge } from "@/components/shared/Primitives";
import { brl } from "@/lib/format";
import { Button } from "@/components/ui/button";

interface MensalidadeData {
  id: string;
  mes_referencia: string;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: string;
  forma_pagamento: string | null;
}

interface AlunoData {
  id: string;
  nome: string;
  sexo: string;
  turma: string;
  status: string;
  situacao: string;
  mensalidades: MensalidadeData[];
}

interface ResponsavelData {
  nome: string;
  email: string;
}

interface PortalData {
  responsavel: ResponsavelData;
  alunos: AlunoData[];
}

export const Route = createFileRoute("/responsavel/dashboard")({
  component: Dashboard,
});

const statusLabel: Record<string, string> = {
  pago: "Pago",
  pendente: "Pendente",
  atrasado: "Atrasado",
};

function formatDate(dateStr: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const [d] = dateStr.split(" ");
    const partes = d.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dateStr;
}

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<PortalData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("responsavel_data");
    if (!stored) {
      navigate({ to: "/responsavel", replace: true });
      return;
    }
    setData(JSON.parse(stored));
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("responsavel_data");
    navigate({ to: "/responsavel" });
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-emerald-600 grid place-items-center text-white">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Portal do Responsável</p>
              <p className="text-xs text-muted-foreground">Associação Bombeiro Paranã</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{data.responsavel.nome}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="size-4" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-xl font-semibold">
            Olá, {data.responsavel.nome.split(" ")[0]}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe abaixo as mensalidades dos alunos vinculados ao seu CPF.
          </p>
        </div>

        {data.alunos.map((aluno) => {
          const pendentes = aluno.mensalidades.filter((m) => m.status === "pendente" || m.status === "atrasado");
          const totalDevido = pendentes.reduce((s, m) => s + m.valor, 0);

          return (
            <section key={aluno.id} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 grid place-items-center text-emerald-600">
                      <User className="size-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-base">{aluno.nome}</h2>
                      <p className="text-xs text-muted-foreground">{aluno.turma}</p>
                    </div>
                  </div>
                  <StatusBadge status={aluno.situacao} />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 sm:p-5 bg-muted/10 border-b border-border">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Mensalidades</p>
                  <p className="text-lg font-semibold">{aluno.mensalidades.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Em aberto</p>
                  <p className="text-lg font-semibold text-warning">{pendentes.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Valor devido</p>
                  <p className="text-lg font-semibold text-destructive">{brl(totalDevido)}</p>
                </div>
              </div>

              <div className="divide-y divide-border">
                {aluno.mensalidades.length === 0 ? (
                  <p className="p-6 text-center text-sm text-muted-foreground">
                    Nenhuma mensalidade cadastrada para este aluno.
                  </p>
                ) : (
                  aluno.mensalidades.map((m) => (
                    <div key={m.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="hidden sm:block">
                          {m.status === "pago" ? (
                            <CheckCircle2 className="size-5 text-success" />
                          ) : m.status === "atrasado" ? (
                            <AlertTriangle className="size-5 text-destructive" />
                          ) : (
                            <Clock className="size-5 text-warning" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{m.mes_referencia}</p>
                          <p className="text-xs text-muted-foreground">
                            Vencimento: {formatDate(m.data_vencimento)}
                            {m.data_pagamento && ` · Pago em: ${formatDate(m.data_pagamento)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`text-sm font-semibold ${
                          m.status === "pago" ? "text-success" : m.status === "atrasado" ? "text-destructive" : "text-warning"
                        }`}>
                          {brl(m.valor)}
                        </span>
                        <StatusBadge status={m.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
