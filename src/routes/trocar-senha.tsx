import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/trocar-senha")({
  component: TrocarSenha,
});

function TrocarSenha() {
  const { user, changePassword } = useAuth();
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const home = user?.role === "secretaria" ? "/alunos" : "/dashboard";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (senha.length < 6) errs.senha = "Mínimo de 6 caracteres";
    if (senha !== confirmacao) errs.confirmacao = "As senhas não conferem";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    const ok = await changePassword(senha, confirmacao);
    setSubmitting(false);
    if (!ok) {
      toast.error("Erro ao alterar a senha. Tente novamente.");
      return;
    }
    toast.success("Senha alterada com sucesso!");
    navigate({ to: home, replace: true });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="size-14 rounded-2xl bg-primary/10 grid place-items-center text-primary mb-4">
              <KeyRound className="size-7" />
            </div>
            <h1 className="text-xl font-semibold">Defina sua nova senha</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {user?.name}, este é seu primeiro acesso. Crie uma senha pessoal e segura para
              continuar.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senha">Nova senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={show ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="h-11 pr-10"
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
              {errors.senha && <p className="text-xs text-destructive">{errors.senha}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmacao">Confirmar nova senha</Label>
              <Input
                id="confirmacao"
                type={show ? "text" : "password"}
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                placeholder="Repita a nova senha"
                className="h-11"
              />
              {errors.confirmacao && (
                <p className="text-xs text-destructive">{errors.confirmacao}</p>
              )}
            </div>

            <Button type="submit" disabled={submitting} className="w-full h-11 text-base">
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ShieldCheck className="size-4" />
              )}
              {submitting ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
