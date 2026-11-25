import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heroImg from "@/assets/cosmetics-flatlay.jpg";
import { supabase } from "@/integrations/supabase/client";
import { STORE_NAME } from "@/lib/brand";

function safeRedirect(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value, "http://x");
    const path = url.pathname + url.search;
    return path.startsWith("/") && !path.startsWith("//") ? path : undefined;
  } catch {
    return undefined;
  }
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string | undefined } => ({
    redirect: safeRedirect(search["redirect"]),
  }),
  head: () => ({
    meta: [
      { title: `Entrar — ${STORE_NAME}` },
      { name: "description", content: "Acesso restrito ao painel de pedidos e recompras da loja." },
      { property: "og:title", content: `Entrar — ${STORE_NAME}` },
      {
        property: "og:description",
        content: "Acesso restrito ao painel de pedidos e recompras da loja.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const target = redirect ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: target, replace: true });
    });
  }, [navigate, target]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos, ou acesso não liberado."
          : error.message,
      );
      return;
    }
    navigate({ to: target, replace: true });
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <section className="flex items-center justify-center px-6 py-12">
        <div className="animate-rise w-full max-w-sm">
          <img
            src="/logo-nature.png"
            alt={STORE_NAME}
            width={1152}
            height={768}
            className="h-auto w-40"
          />
          <h1 className="mt-8 text-4xl font-semibold">Entrar no painel</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Acesso liberado apenas para e-mails cadastrados.
          </p>

          <form onSubmit={onSubmit} className="mt-8 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
              />
            </div>
            <Button type="submit" className="h-11" disabled={loading}>
              {loading ? "Aguarde…" : "Entrar"}
            </Button>
          </form>
        </div>
      </section>
      <section className="relative hidden overflow-hidden lg:block">
        <img
          src={heroImg}
          alt=""
          width={1024}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </section>
    </main>
  );
}
