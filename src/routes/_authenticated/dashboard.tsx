import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AlertTriangle, BellRing, Check, CheckCircle2, MessageCircle, PackageOpen, Wallet } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/confirm-delete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { STORE_NAME } from "@/lib/brand";
import { brl, formatDate, whatsappLink } from "@/lib/format";
import { ordersQuery, productsQuery, type OrderWithRelations } from "@/lib/queries";
import {
  ALERT_WINDOW_DAYS,
  REPURCHASE_DAYS,
  buildRepurchaseList,
  todayISO,
  type RepurchaseInfo,
} from "@/lib/repurchase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: `Alertas de recompra — ${STORE_NAME}` },
      { name: "description", content: "Clientes próximos do prazo de recompra de 30 dias." },
      { property: "og:title", content: `Alertas de recompra — ${STORE_NAME}` },
      { property: "og:description", content: "Clientes próximos do prazo de recompra de 30 dias." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(ordersQuery),
      context.queryClient.ensureQueryData(productsQuery),
    ]),
  component: Dashboard,
});

type Row = OrderWithRelations & RepurchaseInfo;
type Tab = "alerta" | "vencido" | "em_dia";

function Dashboard() {
  const { data: orders } = useSuspenseQuery(ordersQuery);
  const { data: products } = useSuspenseQuery(productsQuery);
  const today = todayISO();
  const list = useMemo(() => buildRepurchaseList(orders, today), [orders, today]);
  const [tab, setTab] = useState<Tab>("alerta");

  const alerts = list.filter((r) => r.status === "alerta");
  const overdue = list.filter((r) => r.status === "vencido");
  const upcoming = list.filter((r) => r.status === "em_dia").sort((a, b) => a.daysLeft - b.daysLeft);
  const pending = [...alerts, ...overdue];
  const contacted = pending.filter((r) => r.repurchase_contacted).length;
  const month = today.slice(0, 7);
  const monthSales = orders
    .filter((o) => o.order_date.startsWith(month) && o.status !== "cancelado")
    .reduce((s, o) => s + Number(o.total), 0);
  const lowStock = products.filter((p) => p.stock <= 3);

  const rows = tab === "alerta" ? alerts : tab === "vencido" ? overdue : upcoming;

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Alertas de recompra"
        description={`O alerta aparece ${ALERT_WINDOW_DAYS} dias antes do prazo de ${REPURCHASE_DAYS} dias após cada compra.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={BellRing} tone="warning" label="Em alerta" value={alerts.length} hint={`Faltam até ${ALERT_WINDOW_DAYS} dias`} />
        <Kpi icon={AlertTriangle} tone="danger" label="Prazo vencido" value={overdue.length} hint={`Mais de ${REPURCHASE_DAYS} dias`} />
        <Kpi icon={CheckCircle2} tone="success" label="Já contatados" value={`${contacted}/${pending.length}`} hint="Entre alertas e vencidos" />
        <Kpi icon={Wallet} tone="rose" label="Vendas no mês" value={brl(monthSales)} hint={`${orders.filter((o) => o.order_date.startsWith(month)).length} pedidos`} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_300px]">
        <section>
          <div className="mb-4 flex flex-wrap gap-2">
            <TabButton active={tab === "alerta"} onClick={() => setTab("alerta")} count={alerts.length}>Em alerta</TabButton>
            <TabButton active={tab === "vencido"} onClick={() => setTab("vencido")} count={overdue.length}>Vencidos</TabButton>
            <TabButton active={tab === "em_dia"} onClick={() => setTab("em_dia")} count={upcoming.length}>Próximos</TabButton>
          </div>

          {orders.length === 0 ? (
            <EmptyState
              title="Nenhum pedido ainda"
              text="Registre o primeiro pedido para acompanhar os prazos de recompra."
              action={<Button asChild><Link to="/pedidos">Registrar pedido</Link></Button>}
            />
          ) : rows.length === 0 ? (
            <EmptyState
              title={tab === "alerta" ? "Nenhum alerta agora" : tab === "vencido" ? "Nenhum prazo vencido" : "Nada por aqui"}
              text={tab === "alerta" ? "Quando faltar 10 dias para o prazo de algum cliente, ele aparece aqui." : "Tudo em ordem."}
            />
          ) : (
            <ul className="grid gap-3">
              {rows.map((r, i) => (
                <AlertRow key={r.id} row={r} index={i} />
              ))}
            </ul>
          )}
        </section>

        <aside className="grid content-start gap-4">
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <p className="font-display text-xl font-semibold">Como funciona</p>
            <ol className="mt-3 grid gap-2 text-sm text-muted-foreground">
              <li><span className="font-semibold text-foreground">Dia 0</span> — cliente compra.</li>
              <li><span className="font-semibold text-warning-foreground">Dia {REPURCHASE_DAYS - ALERT_WINDOW_DAYS}</span> — entra em alerta.</li>
              <li><span className="font-semibold text-destructive">Dia {REPURCHASE_DAYS}</span> — prazo de recompra.</li>
              <li>Uma nova compra reinicia o ciclo.</li>
            </ol>
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <PackageOpen className="size-4 text-primary" />
              <p className="font-display text-xl font-semibold">Estoque baixo</p>
            </div>
            {lowStock.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Nenhum produto com 3 unidades ou menos.</p>
            ) : (
              <ul className="mt-3 grid gap-2">
                {lowStock.slice(0, 6).map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">{p.name}</span>
                    <Badge variant={p.stock === 0 ? "danger" : "warning"}>{p.stock} un.</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

const toneClasses = {
  warning: "bg-warning-soft text-warning-foreground",
  danger: "bg-destructive-soft text-destructive",
  success: "bg-success-soft text-success",
  rose: "bg-primary-soft text-primary",
} as const;

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  hint: string;
  tone: keyof typeof toneClasses;
}) {
  return (
    <div className="animate-rise rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={cn("flex size-8 items-center justify-center rounded-full", toneClasses[tone])}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-4xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function TabButton({ active, onClick, count, children }: { active: boolean; onClick: () => void; count: number; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-accent",
      )}
    >
      {children}
      <span className={cn("rounded-full px-1.5 text-xs", active ? "bg-primary-foreground/20" : "bg-muted")}>{count}</span>
    </button>
  );
}

function daysLabel(r: RepurchaseInfo) {
  if (r.daysLeft > 0) return { big: r.daysLeft, small: r.daysLeft === 1 ? "dia restante" : "dias restantes" };
  if (r.daysLeft === 0) return { big: "Hoje", small: "vence hoje" };
  const late = Math.abs(r.daysLeft);
  return { big: late, small: late === 1 ? "dia de atraso" : "dias de atraso" };
}

function AlertRow({ row, index }: { row: Row; index: number }) {
  const queryClient = useQueryClient();
  const toggle = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("orders")
        .update({ repurchase_contacted: !row.repurchase_contacted })
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(row.repurchase_contacted ? "Marcado como não contatado" : "Cliente marcado como contatado");
    },
    onError: () => toast.error("Não foi possível atualizar."),
  });

  const name = row.customers?.name ?? "Cliente";
  const items = row.order_items.map((i) => i.product_name).join(", ");
  const firstName = name.split(" ")[0];
  const wa = whatsappLink(
    row.customers?.phone,
    `Olá, ${firstName}! Tudo bem? Aqui é da ${STORE_NAME}. Seus produtos${items ? ` (${items})` : ""} já devem estar acabando. Quer que eu separe a reposição para você?`,
  );
  const progress = Math.min(100, Math.max(0, (row.daysSince / REPURCHASE_DAYS) * 100));
  const d = daysLabel(row);
  const bar = row.status === "vencido" ? "bg-destructive" : row.status === "alerta" ? "bg-warning" : "bg-success";
  const numberTone = row.status === "vencido" ? "text-destructive" : row.status === "alerta" ? "text-warning-foreground" : "text-success";

  return (
    <li
      className="animate-rise grid gap-4 rounded-2xl border bg-card p-4 shadow-soft sm:grid-cols-[88px_1fr_auto] sm:items-center sm:p-5"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <div className="flex items-baseline gap-2 sm:block sm:text-center">
        <p className={cn("font-display text-4xl font-semibold leading-none", numberTone)}>{d.big}</p>
        <p className="text-xs text-muted-foreground sm:mt-1">{d.small}</p>
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold">{name}</p>
          {row.status === "alerta" && <Badge variant="warning">Em alerta</Badge>}
          {row.status === "vencido" && <Badge variant="danger">Vencido</Badge>}
          {row.status === "em_dia" && <Badge variant="success">Em dia</Badge>}
          {row.repurchase_contacted && <Badge variant="muted"><Check className="mr-1 size-3" />Contatado</Badge>}
        </div>
        <p className="mt-1 truncate text-sm text-muted-foreground">{items || "Sem itens"}</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className={cn("h-full rounded-full", bar)} style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Compra em {formatDate(row.order_date)} · {row.status === "em_dia" ? `Alerta a partir de ${formatDate(row.alertStartDate)} · ` : ""}Prazo {formatDate(row.dueDate)} · {brl(row.total)}
        </p>
      </div>
      <div className="flex gap-2 sm:flex-col">
        {wa && (
          <Button asChild size="sm" variant="success">
            <a href={wa} target="_blank" rel="noreferrer">
              <MessageCircle /> WhatsApp
            </a>
          </Button>
        )}
        <Button size="sm" variant={row.repurchase_contacted ? "outline" : "soft"} onClick={() => toggle.mutate()} disabled={toggle.isPending}>
          <Check /> {row.repurchase_contacted ? "Desfazer" : "Contatado"}
        </Button>
      </div>
    </li>
  );
}
