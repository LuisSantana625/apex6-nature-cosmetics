import { Link, Outlet, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BellRing, LogOut, Package, ShoppingBag, Users } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { STORE_NAME } from "@/lib/brand";

const nav = [
  { to: "/dashboard", label: "Recompras", icon: BellRing },
  { to: "/pedidos", label: "Pedidos", icon: ShoppingBag },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/produtos", label: "Produtos", icon: Package },
] as const;

export function AppShell() {
  const { user } = useRouteContext({ from: "/_authenticated" });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { redirect: undefined }, replace: true });
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 z-20 flex flex-col bg-sidebar text-sidebar-foreground lg:h-screen">
        <div className="flex items-center justify-between px-5 py-4 lg:block lg:px-6 lg:py-8">
          <div>
            <img
              src="/favicon.png"
              alt={STORE_NAME}
              width={1433}
              height={1049}
              className="h-auto w-28 lg:w-36"
            />
            <p className="mt-2 hidden text-xs text-sidebar-foreground/60 lg:block">Painel da loja</p>
          </div>
          <button
            onClick={signOut}
            className="rounded-md p-2 text-sidebar-foreground/70 hover:bg-sidebar-accent lg:hidden"
            aria-label="Sair"
          >
            <LogOut className="size-4" />
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-0">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-primary"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto hidden border-t border-sidebar-border p-4 lg:block">
          <p className="truncate text-xs text-sidebar-foreground/60">{user.email}</p>
          <button
            onClick={signOut}
            className="mt-2 flex items-center gap-2 text-sm text-sidebar-foreground/80 hover:text-sidebar-primary"
          >
            <LogOut className="size-4" /> Sair
          </button>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 sm:px-8 lg:px-10 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="animate-rise mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
        )}
        <h1 className="text-4xl font-semibold sm:text-5xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {action}
    </header>
  );
}
