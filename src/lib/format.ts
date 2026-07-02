export const brl = (v: number | string) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fmtDate = (iso: string) => {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(iso)) return iso;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("pt-BR");
};

export const maskCPF = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

export const maskDate = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{4})\d*$/, "$1");
};

export const maskPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (digits.length <= 7) return `(${ddd}) ${rest}`;
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5, 9)}`;
};

export const maskCurrency = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  const v = parseInt(digits, 10) / 100;
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const parseCurrency = (masked: string): number => {
  const cleaned = masked.replace(/\D/g, "");
  return parseFloat(cleaned || "0") / 100;
};

const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
const especiais = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

function parteExtenso(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";
  const c = Math.floor(n / 100);
  const d = Math.floor((n % 100) / 10);
  const u = n % 10;
  const partes: string[] = [];
  if (c > 0) partes.push(centenas[c]);
  if (d === 1) {
    partes.push(especiais[u]);
  } else {
    if (d > 1) partes.push(dezenas[d]);
    if (u > 0) partes.push(unidades[u]);
  }
  return partes.join(" e ");
}

export const numeroExtenso = (valor: number): string => {
  if (valor === 0) return "zero reais";
  const inteiro = Math.floor(valor);
  const centavos = Math.round((valor - inteiro) * 100);
  const partes: string[] = [];
  const milhar = Math.floor(inteiro / 1000);
  const resto = inteiro % 1000;
  if (milhar > 0) {
    if (milhar === 1) partes.push("mil");
    else partes.push(`${parteExtenso(milhar)} mil`);
  }
  if (resto > 0) partes.push(parteExtenso(resto));
  const reaisStr = partes.length > 0 ? partes.join(" e ") + (inteiro === 1 ? " real" : " reais") : "";
  if (centavos > 0) {
    const centStr = centavos === 1 ? "um centavo" : `${parteExtenso(centavos)} centavos`;
    return reaisStr ? `${reaisStr} e ${centStr}` : centStr;
  }
  return reaisStr || "zero reais";
};

export const fmtDateFull = (dateStr: string): string => {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split("/");
    const dt = new Date(+y, +m - 1, +d);
    return dt.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
};
