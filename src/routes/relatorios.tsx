import { createFileRoute } from "@tanstack/react-router";
import {
  FileBarChart,
  FileText,
  TrendingUp,
  AlertTriangle,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { PageHeader } from "@/components/shared/Primitives";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/relatorios")({
  component: Relatorios,
});

const cards = [
  {
    title: "Relatório mensal",
    desc: "Receitas, despesas e pagamentos do mês atual",
    icon: FileText,
    tone: "bg-primary/10 text-primary",
  },
  {
    title: "Relatório anual",
    desc: "Visão consolidada do ano letivo",
    icon: FileBarChart,
    tone: "bg-info/10 text-info",
  },
  {
    title: "Inadimplência",
    desc: "Lista detalhada de alunos em atraso",
    icon: AlertTriangle,
    tone: "bg-destructive/10 text-destructive",
  },
  {
    title: "Fluxo de caixa",
    desc: "Entradas e saídas projetadas",
    icon: TrendingUp,
    tone: "bg-success/10 text-success",
  },
];

function Relatorios() {
  return (
    <>
      <PageHeader title="Relatórios" description="Exporte dados em PDF ou Excel" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 animate-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`size-12 rounded-lg grid place-items-center ${c.tone} mb-4`}>
                <Icon className="size-6" />
              </div>
              <h3 className="font-semibold">{c.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => toast.success(`PDF: ${c.title} gerado`)} size="sm">
                  <Download className="size-4" /> PDF
                </Button>
                <Button
                  onClick={() => toast.success(`Excel: ${c.title} gerado`)}
                  variant="outline"
                  size="sm"
                >
                  <FileSpreadsheet className="size-4" /> Excel
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
