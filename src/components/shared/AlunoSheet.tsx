import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, X } from "lucide-react";
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
import { StatusBadge } from "@/components/shared/Primitives";
import type { Aluno } from "@/lib/mock-data";
import { maskCPF, maskDate, maskPhone, maskCurrency, parseCurrency, fmtDate } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const schema = z.object({
  nome: z.string().min(3, "Nome muito curto").max(120),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido (000.000.000-00)")
    .or(z.literal("")),
  dataNascimento: z.string().min(1, "Obrigatório"),
  telefone: z.string().min(10, "Telefone inválido").max(20),
  email: z.string().email("E-mail inválido"),
  endereco: z.string().min(3, "Endereço obrigatório").max(200),
  responsavel: z.string().min(3, "Nome do responsável obrigatório"),
  cpfResponsavel: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF do responsável inválido")
    .or(z.literal("")),
  telefoneResponsavel: z.string().min(10, "Telefone do responsável inválido"),
  turma: z.string().min(1, "Selecione uma turma"),
  status: z.enum(["ativo", "inativo"]),
  valorMensalidade: z.coerce.number().min(0, "Valor inválido"),
  diaVencimento: z.coerce.number().int().min(1, "Mínimo 1").max(31, "Máximo 31"),
});

type FormData = z.infer<typeof schema>;

const viewCls =
  "w-full min-h-10 px-3 py-2.5 rounded-md bg-muted/30 border border-border text-sm text-foreground flex items-center";

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
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

const emptyAluno: Aluno = {
  id: "",
  nome: "",
  cpf: "",
  dataNascimento: "",
  telefone: "",
  email: "",
  endereco: "",
  responsavel: "",
  cpfResponsavel: "",
  telefoneResponsavel: "",
  turma: "",
  status: "ativo",
  valorMensalidade: 0,
  diaVencimento: 10,
};

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
  mode: "view" | "edit" | "create";
  onSave: (data: Aluno) => void | Promise<void>;
}) {
  const isCreate = mode === "create";
  const [editing, setEditing] = useState(mode === "edit" || isCreate);

  const current = aluno ?? emptyAluno;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: isCreate
      ? undefined
      : {
          ...current,
          valorMensalidade: current.valorMensalidade ?? 0,
          diaVencimento: current.diaVencimento ?? 10,
          dataNascimento: current.dataNascimento?.includes("/")
            ? current.dataNascimento
            : fmtDate(current.dataNascimento),
        },
    defaultValues: isCreate ? { status: "ativo", valorMensalidade: 0, diaVencimento: 10 } : undefined,
  });

  const onSubmit = async (data: FormData) => {
    if (isCreate) {
      const novo: Aluno = {
        id: String(Date.now()),
        ...data,
        situacao: "em_dia",
        cpf: data.cpf || "",
        cpfResponsavel: data.cpfResponsavel || "",
      };
      await onSave(novo);
      onOpenChange(false);
    } else {
      await onSave({ ...current, ...data });
      setEditing(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-4 sm:p-6">
        <SheetHeader className="pr-8">
          <SheetTitle>
            {isCreate ? "Novo aluno" : editing ? "Editando aluno" : current.nome}
          </SheetTitle>
          <SheetDescription>
            {isCreate
              ? "Preencha os dados para cadastrar um novo aluno"
              : editing
                ? "Editando dados do aluno"
                : "Visualizando dados do aluno"}
          </SheetDescription>
        </SheetHeader>

        <form id="aluno-sheet-form" onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <section className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary inline-block" />
              Dados do aluno
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nome completo" error={errors.nome?.message} className="sm:col-span-2">
                {editing ? (
                  <Input
                    className="h-10"
                    placeholder="Nome completo do aluno"
                    {...register("nome")}
                  />
                ) : (
                  <p className={viewCls}>{current.nome}</p>
                )}
              </Field>
              <Field label="CPF" error={errors.cpf?.message}>
                {editing ? (
                  <Input
                    className="h-10"
                    placeholder="000.000.000-00"
                    {...register("cpf")}
                    onChange={(e) => {
                      const masked = maskCPF(e.target.value);
                      e.target.value = masked;
                      setValue("cpf", masked, { shouldValidate: true });
                    }}
                  />
                ) : (
                  <p className={viewCls}>{current.cpf}</p>
                )}
              </Field>
              <Field label="Data de nascimento" error={errors.dataNascimento?.message}>
                {editing ? (
                  <Input
                    className="h-10"
                    placeholder="DD/MM/AAAA"
                    {...register("dataNascimento")}
                    onChange={(e) => {
                      const masked = maskDate(e.target.value);
                      e.target.value = masked;
                      setValue("dataNascimento", masked, { shouldValidate: true });
                    }}
                  />
                ) : (
                  <p className={viewCls}>
                    {current.dataNascimento ? fmtDate(current.dataNascimento) : ""}
                  </p>
                )}
              </Field>
              <Field label="Telefone" error={errors.telefone?.message}>
                {editing ? (
                  <Input
                    className="h-10"
                    placeholder="(11) 99999-9999"
                    {...register("telefone")}
                    onChange={(e) => {
                      const masked = maskPhone(e.target.value);
                      e.target.value = masked;
                      setValue("telefone", masked, { shouldValidate: true });
                    }}
                  />
                ) : (
                  <p className={viewCls}>{current.telefone}</p>
                )}
              </Field>
              <Field label="E-mail" error={errors.email?.message}>
                {editing ? (
                  <Input
                    type="email"
                    className="h-10"
                    placeholder="aluno@email.com"
                    {...register("email")}
                  />
                ) : (
                  <p className={viewCls}>{current.email}</p>
                )}
              </Field>
              <Field label="Endereço" error={errors.endereco?.message} className="sm:col-span-2">
                {editing ? (
                  <Input
                    className="h-10"
                    placeholder="Rua, número, bairro"
                    {...register("endereco")}
                  />
                ) : (
                  <p className={viewCls}>{current.endereco}</p>
                )}
              </Field>
            </div>
          </section>

          <section className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary inline-block" />
              Responsável financeiro
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field
                label="Nome do responsável"
                error={errors.responsavel?.message}
                className="sm:col-span-2"
              >
                {editing ? (
                  <Input
                    className="h-10"
                    placeholder="Nome completo do responsável"
                    {...register("responsavel")}
                  />
                ) : (
                  <p className={viewCls}>{current.responsavel}</p>
                )}
              </Field>
              <Field label="CPF do responsável" error={errors.cpfResponsavel?.message}>
                {editing ? (
                  <Input
                    className="h-10"
                    placeholder="000.000.000-00"
                    {...register("cpfResponsavel")}
                    onChange={(e) => {
                      const masked = maskCPF(e.target.value);
                      e.target.value = masked;
                      setValue("cpfResponsavel", masked, { shouldValidate: true });
                    }}
                  />
                ) : (
                  <p className={viewCls}>{current.cpfResponsavel}</p>
                )}
              </Field>
              <Field label="Telefone do responsável" error={errors.telefoneResponsavel?.message}>
                {editing ? (
                  <Input
                    className="h-10"
                    placeholder="(11) 99999-9999"
                    {...register("telefoneResponsavel")}
                    onChange={(e) => {
                      const masked = maskPhone(e.target.value);
                      e.target.value = masked;
                      setValue("telefoneResponsavel", masked, { shouldValidate: true });
                    }}
                  />
                ) : (
                  <p className={viewCls}>{current.telefoneResponsavel}</p>
                )}
              </Field>
            </div>
          </section>

          <section className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary inline-block" />
              Matrícula
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Série / Turma" error={errors.turma?.message}>
                {editing ? (
                  <Controller
                    name="turma"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "1º Ano A",
                            "1º Ano B",
                            "2º Ano A",
                            "3º Ano A",
                            "5º Ano B",
                            "6º Ano A",
                            "9º Ano A",
                          ].map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : (
                  <p className={viewCls}>{current.turma}</p>
                )}
              </Field>
              <Field label="Status" error={errors.status?.message}>
                {editing ? (
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value || "ativo"} onValueChange={field.onChange}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : (
                  <div className={viewCls}>
                    <StatusBadge status={current.status} />
                  </div>
                )}
              </Field>
              <Field label="Valor mensalidade (R$)" error={errors.valorMensalidade?.message}>
                {editing ? (
                    <Controller
                      name="valorMensalidade"
                      control={control}
                      render={({ field }) => (
                        <Input
                          className="h-10"
                          placeholder="0,00"
                          value={field.value !== null && field.value !== undefined && !isNaN(field.value) ? maskCurrency(String(field.value)) : ""}
                          onChange={(e) => {
                            const masked = maskCurrency(e.target.value);
                            e.target.value = masked;
                            field.onChange(masked ? parseCurrency(masked) : 0);
                          }}
                        />
                      )}
                    />
                ) : (
                  <p className={viewCls}>
                    {current.valorMensalidade
                      ? current.valorMensalidade.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                      : "—"}
                  </p>
                )}
              </Field>
              <Field label="Dia vencimento" error={errors.diaVencimento?.message}>
                {editing ? (
                  <Controller
                    name="diaVencimento"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        className="h-10"
                        placeholder="10"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(Number(e.target.value) || 10)}
                      />
                    )}
                  />
                ) : (
                  <p className={viewCls}>Dia {current.diaVencimento}</p>
                )}
              </Field>
            </div>
          </section>
        </form>

        {editing && (
          <div className="sticky bottom-0 pt-4 pb-2 bg-background border-t border-border mt-6 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                if (isCreate) {
                  onOpenChange(false);
                } else {
                  setEditing(false);
                }
              }}
            >
              <X className="size-4" /> Cancelar
            </Button>
            <Button type="submit" form="aluno-sheet-form" disabled={isSubmitting}>
              <Save className="size-4" />{" "}
              {isSubmitting ? "Salvando..." : isCreate ? "Cadastrar" : "Salvar"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
