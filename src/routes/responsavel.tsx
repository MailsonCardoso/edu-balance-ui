import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(11, "CPF deve ter 11 dígitos").max(11, "CPF deve ter 11 dígitos"),
});

type Data = z.infer<typeof schema>;

export const Route = createFileRoute("/responsavel")({
  component: ResponsavelLogin,
});

function ResponsavelLogin() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Data>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", senha: "" },
  });

  const onSubmit = async (data: Data) => {
    try {
      const res = await api.post("/responsavel/login", {
        email: data.email,
        senha: data.senha,
      });
      localStorage.setItem("responsavel_data", JSON.stringify(res.data));
      toast.success("Bem-vindo(a) ao portal!");
      navigate({ to: "/responsavel/dashboard" });
    } catch {
      toast.error("E-mail ou senha inválidos");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative">
          <h2 className="text-4xl font-semibold leading-tight">
            Portal do Responsável
          </h2>
          <p className="mt-4 text-white/85 max-w-md">
            Acompanhe as mensalidades dos seus filhos de forma simples e rápida.
          </p>
        </div>
        <p className="relative text-sm text-white/70">
          Associação Bombeiro Paranã — Colégio Militar 2 de Julho – Unidade XII
        </p>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm animate-in">
          <h1 className="text-2xl font-semibold">Acesse o portal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Use o e-mail do responsável e o CPF (somente números) como senha
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail do responsável</Label>
              <Input id="email" type="email" className="h-11" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">CPF do responsável (somente números)</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={show ? "text" : "password"}
                  className="h-11 pr-10"
                  placeholder="00000000000"
                  maxLength={11}
                  {...register("senha")}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    e.target.value = digits;
                    register("senha").onChange(e);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.senha && <p className="text-xs text-destructive">{errors.senha.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-base">
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
