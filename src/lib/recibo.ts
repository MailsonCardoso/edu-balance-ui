import jsPDF from "jspdf";
import type { Mensalidade } from "@/lib/mock-data";
import { brl, fmtDate, fmtDateFull, numeroExtenso } from "@/lib/format";

const formaPagamentoLabel: Record<string, string> = {
  pix: "Pix",
  debito: "Débito",
  credito: "Crédito",
};

function labelPagamento(m: Mensalidade): string {
  if (m.formaPagamento) return formaPagamentoLabel[m.formaPagamento] ?? m.formaPagamento;
  if (m.origem === "mercadopago") return "Mercado Pago";
  if (m.origem === "pix_manual") return "PIX";
  return "—";
}

export function gerarPdfBlob(m: Mensalidade): Promise<Blob> {
  const dataPg = m.dataPagamento ? fmtDateFull(m.dataPagamento) : "—";
  const valorExtenso = numeroExtenso(m.valor);
  const rotulo = m.alunoSexo === "feminino" ? "Aluna" : "Aluno";
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ml = 25;
  const cw = 160;
  let y = 35;

  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.text("Comprovante de Pagamento", ml + cw / 2, y, { align: "center" });

  y += 9;
  doc.setFontSize(12);
  doc.text("Bombeiro Paranã", ml + cw / 2, y, { align: "center" });

  y += 6;
  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.text("Colégio Militar 2 de Julho – Unidade XII – Paranã", ml + cw / 2, y, { align: "center" });

  y += 8;
  doc.setDrawColor(200);
  doc.line(ml, y, ml + cw, y);

  y += 12;
  doc.setDrawColor(220);
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(ml, y, cw, 44, 3, 3, "FD");

  const ix = ml + 6;
  let iy = y + 7;
  const labelW = 42;

  const info: [string, string][] = [
    [`${rotulo}:`, m.alunoNome || "—"],
    ["Responsável:", m.alunoResponsavel || "—"],
    ["Mês:", m.mesReferencia],
    ["Valor:", `${brl(m.valor)} (${valorExtenso})`],
    ["Pagamento:", dataPg],
    ["Forma:", labelPagamento(m)],
  ];

  for (const [label, value] of info) {
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.text(label, ix, iy);
    doc.setFont("times", "normal");
    doc.text(value, ix + labelW, iy, { maxWidth: cw - labelW - 12 });
    iy += 7;
  }

  y = iy + 10;
  doc.text(`Paranã, ${dataPg}.`, ml + cw / 2, y, { align: "center" });

  y += 24;
  doc.setDrawColor(0);
  doc.line(ml + 30, y, ml + cw - 30, y);
  y += 2;
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.text("Responsável pelo Recebimento", ml + cw / 2, y + 4, { align: "center" });
  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.text("Colégio Militar 2 de Julho – Unidade XII – Paranã", ml + cw / 2, y + 10, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(150);
  const agora = new Date();
  doc.text(
    `Documento gerado em ${agora.toLocaleDateString("pt-BR")} às ${agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
    ml + cw / 2,
    288,
    { align: "center" },
  );

  return Promise.resolve(doc.output("blob"));
}

export async function baixarPdfRecibo(m: Mensalidade): Promise<void> {
  const blob = await gerarPdfBlob(m);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `comprovante-${m.id}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
