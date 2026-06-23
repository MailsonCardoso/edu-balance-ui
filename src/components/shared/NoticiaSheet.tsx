import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Save, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  createNoticia,
  updateNoticia,
  type Noticia,
} from "@/lib/api/noticias";
import { fetchCategorias } from "@/lib/api/categorias";

const viewCls =
  "w-full min-h-10 px-3 py-2.5 rounded-md bg-muted/30 border border-border text-sm text-foreground flex items-center";

function Field({
  label,
  children,
  className,
  optional,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  optional?: boolean;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
        {label}
        {optional && (
          <span className="text-[10px] text-muted-foreground/50 font-normal">
            (opcional)
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

export function NoticiaSheet({
  open,
  onOpenChange,
  item,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Noticia | null;
  onSaved: () => void;
}) {
  const isCreate = !item;
  const [editing, setEditing] = useState(isCreate);

  const [title, setTitle] = useState(item?.title ?? "");
  const [summary, setSummary] = useState(item?.summary ?? "");
  const [content, setContent] = useState(item?.content ?? "");
  const [category, setCategory] = useState(item?.category ?? "");
  const [image, setImage] = useState(item?.image ?? "");
  const [author, setAuthor] = useState(item?.author ?? "");
  const [status, setStatus] = useState(item?.status ?? "publicado");
  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: fetchCategorias,
    staleTime: 60000,
  });

  const [saving, setSaving] = useState(false);

  const resetFields = () => {
    setTitle(item?.title ?? "");
    setSummary(item?.summary ?? "");
    setContent(item?.content ?? "");
    setCategory(item?.category ?? "");
    setImage(item?.image ?? "");
    setAuthor(item?.author ?? "");
    setStatus(item?.status ?? "publicado");
  };

  const handleCancel = () => {
    if (isCreate) {
      onOpenChange(false);
    } else {
      resetFields();
      setEditing(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("O título é obrigatório");
      return;
    }
    if (!category) {
      toast.error("Selecione uma categoria");
      return;
    }

    setSaving(true);
    try {
      if (isCreate) {
        await createNoticia({
          title: title.trim(),
          summary: summary.trim() || undefined,
          content: content.trim() || undefined,
          category,
          image: image.trim() || undefined,
          author: author.trim() || undefined,
          status,
        });
        toast.success("Notícia criada com sucesso!");
      } else {
        await updateNoticia(item.id, {
          title: title.trim(),
          summary: summary.trim() || undefined,
          content: content.trim() || undefined,
          category,
          image: image.trim() || undefined,
          author: author.trim() || undefined,
          status,
        });
        toast.success("Notícia atualizada com sucesso!");
      }
      onSaved();
    } catch {
      toast.error("Erro ao salvar notícia");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-4 sm:p-6">
        <SheetHeader className="pr-8">
          <SheetTitle>
            {isCreate ? "Nova notícia" : editing ? "Editando notícia" : item.title}
          </SheetTitle>
          <SheetDescription>
            {isCreate
              ? "Preencha os dados para criar uma nova notícia"
              : editing
                ? "Editando dados da notícia"
                : "Visualizando dados da notícia"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="space-y-3">
            <Field label="Título">
              {editing ? (
                <Input
                  className="h-10"
                  placeholder="Título da notícia"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              ) : (
                <p className={viewCls}>{item?.title}</p>
              )}
            </Field>

            <Field label="Resumo" optional>
              {editing ? (
                <textarea
                  className="w-full min-h-[80px] px-3 py-2.5 rounded-md border border-input bg-background text-sm outline-none focus:border-ring transition-colors resize-y"
                  placeholder="Breve resumo da notícia..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              ) : (
                <p className={viewCls}>{item?.summary || "—"}</p>
              )}
            </Field>

            <Field label="Conteúdo completo" optional>
              {editing ? (
                <textarea
                  className="w-full min-h-[120px] px-3 py-2.5 rounded-md border border-input bg-background text-sm outline-none focus:border-ring transition-colors resize-y"
                  placeholder="Texto completo da notícia..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              ) : (
                <p className={viewCls}>
                  {item?.content
                    ? item.content.length > 100
                      ? item.content.slice(0, 100) + "..."
                      : item.content
                    : "—"}
                </p>
              )}
            </Field>

            <Field label="Categoria">
              {editing ? (
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className={viewCls}>{item?.category}</p>
              )}
            </Field>

            <Field label="Status">
              {editing ? (
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publicado">Publicado</SelectItem>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className={viewCls}>
                  {item?.status === "publicado" ? "Publicado" : "Rascunho"}
                </p>
              )}
            </Field>

            <Field label="Imagem (URL)" optional>
              {editing ? (
                <Input
                  className="h-10"
                  placeholder="https://..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              ) : (
                <p className={viewCls}>{item?.image || "—"}</p>
              )}
            </Field>

            <Field label="Autor" optional>
              {editing ? (
                <Input
                  className="h-10"
                  placeholder="Nome do autor"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              ) : (
                <p className={viewCls}>{item?.author || "—"}</p>
              )}
            </Field>
          </div>
        </div>

        {editing && (
          <div className="sticky bottom-0 pt-4 pb-2 bg-background border-t border-border mt-6 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              <X className="size-4" /> Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="size-4" />{" "}
              {saving ? "Salvando..." : isCreate ? "Criar" : "Salvar"}
            </Button>
          </div>
        )}

        {!editing && !isCreate && (
          <div className="sticky bottom-0 pt-4 pb-2 bg-background border-t border-border mt-6 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
            <Button onClick={() => setEditing(true)}>
              <Pencil className="size-4" /> Editar
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
