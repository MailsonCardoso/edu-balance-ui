import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Plus, Trash2, FileText, Upload, Loader2, Download } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader, EmptyState } from "@/components/shared/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  fetchDocumentos,
  uploadDocumento,
  uploadDocumentoChunked,
  deleteDocumento,
  type Documento,
} from "@/lib/api/documentos";

export const Route = createFileRoute("/gestao-documentos")({
  component: GestaoDocumentos,
});

function GestaoDocumentos() {
  const [deleteTarget, setDeleteTarget] = useState<Documento | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newTitulo, setNewTitulo] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ["documentos", "transparencia"],
    queryFn: () => fetchDocumentos("transparencia"),
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, titulo }: { file: File; titulo: string }) => {
      const isLarge = file.size > 1.5 * 1024 * 1024;
      if (isLarge) {
        return uploadDocumentoChunked(file, titulo, "transparencia", (current, total) => {
          setUploadProgress(current);
          setUploadTotal(total);
        });
      }
      const formData = new FormData();
      formData.append("titulo", titulo);
      formData.append("tipo", "transparencia");
      formData.append("arquivo", file);
      return uploadDocumento(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos"] });
      toast.success("Documento enviado com sucesso!");
      setUploadOpen(false);
      setNewTitulo("");
      setNewFile(null);
      setUploadProgress(0);
      setUploadTotal(0);
    },
    onError: () => toast.error("Erro ao enviar documento"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteDocumento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos"] });
      toast.success("Documento excluído!");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Erro ao excluir documento"),
  });

  function handleUpload() {
    if (!newTitulo.trim() || !newFile) return;
    uploadMutation.mutate({ file: newFile, titulo: newTitulo.trim() });
  }

  return (
    <div>
      <PageHeader
        title="Documentos"
        description="Gerencie os documentos disponíveis no Portal da Transparência"
        actions={
          <Button onClick={() => setUploadOpen(true)}>
            <Plus className="size-4" /> Novo Documento
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : documentos.length === 0 ? (
        <EmptyState
          title="Nenhum documento"
          description="Adicione documentos para aparecerem no Portal da Transparência."
          icon={<FileText className="size-6 text-muted-foreground" />}
        />
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 text-sm text-muted-foreground">
                <th className="text-left px-4 py-3 font-medium">Título</th>
                <th className="text-left px-4 py-3 font-medium">Arquivo</th>
                <th className="text-left px-4 py-3 font-medium">Enviado em</th>
                <th className="text-right px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {documentos.map((doc) => (
                <tr key={doc.id} className="border-t border-border text-sm hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{doc.titulo}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <Download className="size-3.5" /> Baixar
                    </a>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{doc.created_at}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(doc)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Novo Documento</AlertDialogTitle>
            <AlertDialogDescription>
              Faça upload de um documento para o Portal da Transparência.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Título</label>
              <Input
                value={newTitulo}
                onChange={(e) => setNewTitulo(e.target.value)}
                placeholder="Ex: Balancete Mensal - Junho 2026"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Arquivo (PDF, DOC, XLS, ZIP - máx 50MB)</label>
              <Input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                onChange={(e) => setNewFile(e.target.files?.[0] ?? null)}
              />
            </div>
            {uploadMutation.isPending && uploadTotal > 0 && (
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
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={uploadMutation.isPending} onClick={() => { setNewTitulo(""); setNewFile(null); }}>Cancelar</AlertDialogCancel>
            <Button
              disabled={!newTitulo.trim() || !newFile || uploadMutation.isPending}
              onClick={handleUpload}
            >
              {uploadMutation.isPending ? (
                uploadTotal > 0 ? `${uploadProgress}/${uploadTotal}` : <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {uploadMutation.isPending ? " Enviando..." : " Enviar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O arquivo será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              {deleteMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
