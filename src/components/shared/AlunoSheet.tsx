import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Save, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/shared/Primitives";
import type { Aluno } from "@/lib/mock-data";
import { maskCPF } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const schema = z.object({
  nome: z.string().min(3, "Nome muito curto").max(120),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido (000.000.000-00)"),
  dataNascimento: z.string().min(1, "Obrigatório"),
  telefone: z.string().min(10, "Telefone inválido").max(20),
  email: z.string().email("E-mail inválido"),
  endereco: z.string().min(3, "Endereço obrigatório").max(200),
  responsavel: z.string().min(3, "Nome do responsável obrigatório"),
  cpfResponsavel: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF do responsável inválido"),
  telefoneResponsavel: z.string().min(10, "Telefone do responsável inválido"),
  turma: z.string().min(1, "Selecione uma turma"),
  status: z.enum(["ativo", "inativo"]),
});

type FormData = z.infer<typeof schema>;

const inputCls =
  "w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring transition-colors";

const viewCls = "text-sm py-2.5 text-foreground";

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function AlunoSheet({
  open,
  onOpenChange,
  aluno,
  mode,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aluno: Aluno | null;
  mode: "view" | "edit";
  onSave: (data: Aluno) => void;
}) {
  const [editing, setEditing] = useState(mode === "edit");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: aluno ? { ...aluno } : undefined,
  });

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 600));
    onSave({ ...aluno!, ...data });
    setEditing(false);
    toast.success("Aluno atualizado com sucesso!");
  };

  if (!aluno) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pr-8">
          <SheetTitle>{aluno.nome}</SheetTitle>
          <SheetDescription>
            {editing ? "Editando dados do aluno" : "Visualizando dados do aluno"}
          </SheetDescription>
        </SheetHeader>

        <form id="aluno-sheet-form" onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <section className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary inline-block" />
              Dados do aluno
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nome completo" error={errors.nome?.message} className="col-span-2">
                {editing ? (
                  <input className={inputCls} {...register("nome")} />
                ) : (
                  <p className={viewCls}>{aluno.nome}</p>
                )}
              </Field>
              <Field label="CPF" error={errors.cpf?.message}>
                {editing ? (
                  <input
                    className={inputCls}
                    {...register("cpf")}
                    onChange={(e) => {
                      const masked = maskCPF(e.target.value);
                      e.target.value = masked;
                      setValue("cpf", masked, { shouldValidate: true });
                    }}
                  />
                ) : (
                  <p className={viewCls}>{aluno.cpf}</p>
                )}
              </Field>
              <Field label="Data de nascimento" error={errors.dataNascimento?.message}>
                {editing ? (
                  <input type="date" className={inputCls} {...register("dataNascimento")} />
                ) : (
                  <p className={viewCls}>{aluno.dataNascimento}</p>
                )}
              </Field>
              <Field label="Telefone" error={errors.telefone?.message}>
                {editing ? (
                  <input className={inputCls} {...register("telefone")} />
                ) : (
                  <p className={viewCls}>{aluno.telefone}</p>
                )}
              </Field>
              <Field label="E-mail" error={errors.email?.message}>
                {editing ? (
                  <input type="email" className={inputCls} {...register("email")} />
                ) : (
                  <p className={viewCls}>{aluno.email}</p>
                )}
              </Field>
              <Field label="Endereço" error={errors.endereco?.message} className="col-span-2">
                {editing ? (
                  <input className={inputCls} {...register("endereco")} />
                ) : (
                  <p className={viewCls}>{aluno.endereco}</p>
                )}
              </Field>
            </div>
          </section>

          <section className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary inline-block" />
              Responsável financeiro
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nome do responsável" error={errors.responsavel?.message} className="col-span-2">
                {editing ? (
                  <input className={inputCls} {...register("responsavel")} />
                ) : (
                  <p className={viewCls}>{aluno.responsavel}</p>
                )}
              </Field>
              <Field label="CPF do responsável" error={errors.cpfResponsavel?.message}>
                {editing ? (
                  <input
                    className={inputCls}
                    {...register("cpfResponsavel")}
                    onChange={(e) => {
                      const masked = maskCPF(e.target.value);
                      e.target.value = masked;
                      setValue("cpfResponsavel", masked, { shouldValidate: true });
                    }}
                  />
                ) : (
                  <p className={viewCls}>{aluno.cpfResponsavel}</p>
                )}
              </Field>
              <Field label="Telefone do responsável" error={errors.telefoneResponsavel?.message}>
                {editing ? (
                  <input className={inputCls} {...register("telefoneResponsavel")} />
                ) : (
                  <p className={viewCls}>{aluno.telefoneResponsavel}</p>
                )}
              </Field>
            </div>
          </section>

          <section className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary inline-block" />
              Matrícula
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Série / Turma" error={errors.turma?.message}>
                {editing ? (
                  <select className={inputCls} {...register("turma")}>
                    {["1º Ano A", "1º Ano B", "2º Ano A", "3º Ano A", "5º Ano B", "6º Ano A", "9º Ano A"].map(
                      (t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ),
                    )}
                  </select>
                ) : (
                  <p className={viewCls}>{aluno.turma}</p>
                )}
              </Field>
              <Field label="Status" error={errors.status?.message}>
                {editing ? (
                  <select className={inputCls} {...register("status")}>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                ) : (
                  <StatusBadge status={aluno.status} />
                )}
              </Field>
              <Field label="Situação financeira">
                <StatusBadge status={aluno.situacao} />
              </Field>
            </div>
          </section>
        </form>

        <div className="sticky bottom-0 pt-4 pb-2 bg-background border-t border-border mt-6 flex items-center justify-end gap-2">
          {editing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setEditing(false);
                }}
                className="h-10 px-4 inline-flex items-center gap-2 rounded-md border border-input hover:bg-accent text-sm"
              >
                <X className="size-4" /> Cancelar
              </button>
              <button
                type="submit"
                form="aluno-sheet-form"
                disabled={isSubmitting}
                className="h-10 px-5 inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-60"
              >
                <Save className="size-4" /> {isSubmitting ? "Salvando..." : "Salvar"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="h-10 px-4 inline-flex items-center gap-2 rounded-md border border-input hover:bg-accent text-sm"
            >
              <Pencil className="size-4" /> Editar
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
