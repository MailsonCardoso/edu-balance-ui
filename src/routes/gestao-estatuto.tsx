import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Upload, FileText, Loader2, Download, CheckCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  fetchDocumentos,
  uploadDocumento,
  uploadDocumentoChunked,
  deleteDocumento,
} from "@/lib/api/documentos";

export const Route = createFileRoute("/gestao-estatuto")({
  component: GestaoEstatuto,
});

function GestaoEstatuto() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ["documentos", "estatuto"],
    queryFn: () => fetchDocumentos("estatuto"),
  });

  const estatuto = documentos[0] ?? null;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Nenhum arquivo selecionado");

      if (estatuto) {
        await deleteDocumento(estatuto.id);
      }

      const isLarge = file.size > 1.5 * 1024 * 1024;
      if (isLarge) {
        return uploadDocumentoChunked(file, "Estatuto Social", "estatuto", (current, total) => {
          setUploadProgress(current);
          setUploadTotal(total);
        });
      }
      const formData = new FormData();
      formData.append("titulo", "Estatuto Social");
      formData.append("tipo", "estatuto");
      formData.append("arquivo", file);
      return uploadDocumento(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos"] });
      toast.success("Estatuto enviado com sucesso!");
      setFile(null);
      setUploadProgress(0);
      setUploadTotal(0);
    },
    onError: () => toast.error("Erro ao enviar estatuto"),
  });

  function handleSubmit() {
    if (!file) return;
    mutation.mutate();
  }

  const isPending = mutation.isPending;

  return (
    <div>
      <PageHeader
        title="Estatuto Social"
        description="Gerencie o arquivo PDF do Estatuto Social da associação"
      />

      <div className="max-w-lg">
        <div className="border border-border rounded-xl p-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : estatuto ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <FileText className="size-8 text-red-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{estatuto.titulo}</p>
                  <p className="text-xs text-muted-foreground">Enviado em {estatuto.created_at}</p>
                </div>
                <a
                  href={estatuto.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 size-8 rounded-lg bg-background border border-border grid place-items-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                >
                  <Download className="size-4" />
                </a>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium mb-2">Substituir PDF</p>
                <Input
                  ref={fileRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-6">
                <FileText className="size-10 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Nenhum estatuto enviado ainda.</p>
              </div>
              <Input
                ref={fileRef}
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          )}

          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="size-4 text-emerald-500" />
              <span className="truncate">{file.name}</span>
              <span className="text-xs">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
            </div>
          )}

          {isPending && uploadTotal > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Enviando partes...</span>
                <span>{uploadProgress}/{uploadTotal}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${(uploadProgress / uploadTotal) * 100}%` }}
                />
              </div>
            </div>
          )}

          <Button
            className="w-full"
            disabled={!file || isPending}
            onClick={handleSubmit}
          >
            {isPending ? (
              uploadTotal > 0 ? `${uploadProgress}/${uploadTotal}` : <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {isPending ? " Enviando..." : estatuto ? "Substituir Estatuto" : "Enviar Estatuto"}
          </Button>
        </div>
      </div>
    </div>
  );
}
