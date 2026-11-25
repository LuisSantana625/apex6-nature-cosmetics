import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { STORE_NAME } from "@/lib/brand";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: `Nova senha — ${STORE_NAME}` },
      { name: "description", content: "Defina uma nova senha para acessar o painel." },
      { property: "og:title", content: `Nova senha — ${STORE_NAME}` },
      { property: "og:description", content: "Defina uma nova senha para acessar o painel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error("O link expirou ou é inválido. Peça um novo link.");
      return;
    }
    toast.success("Senha atualizada!");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={onSubmit} className="animate-rise grid w-full max-w-sm gap-4">
        <img
          src="/logo-nature.png"
          alt={STORE_NAME}
          width={1152}
          height={768}
          className="h-auto w-36"
        />
        <h1 className="text-4xl font-semibold">Nova senha</h1>
        <div className="grid gap-2">
          <Label htmlFor="password">Nova senha</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11"
          />
        </div>
        <Button type="submit" className="h-11" disabled={loading}>
          {loading ? "Salvando…" : "Salvar nova senha"}
        </Button>
      </form>
    </main>
  );
}
