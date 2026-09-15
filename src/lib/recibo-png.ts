import html2canvas from "html2canvas";

export async function reciboParaPng(el: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(el, {
    scale: Math.max(2, Math.min(window.devicePixelRatio || 1, 3)),
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Falha ao gerar a imagem do recibo"));
    }, "image/png");
  });
}

export async function baixarPngRecibo(el: HTMLElement, nomeArquivo: string): Promise<void> {
  const blob = await reciboParaPng(el);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo.endsWith(".png") ? nomeArquivo : `${nomeArquivo}.png`;
  a.click();
  URL.revokeObjectURL(url);
}