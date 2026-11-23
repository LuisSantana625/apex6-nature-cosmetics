import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app-shell";
import { ConfirmDelete, EmptyState } from "@/components/confirm-delete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { STORE_NAME } from "@/lib/brand";
import { ORDER_STATUSES, PAYMENT_METHODS, brl, formatDate, labelOf } from "@/lib/format";
import { customersQuery, ordersQuery, productsQuery } from "@/lib/queries";
import { getRepurchaseInfo, hasRepurchased, todayISO } from "@/lib/repurchase";

export const Route = createFileRoute("/_authenticated/pedidos")({
  head: () => ({
    meta: [
      { title: `Pedidos — ${STORE_NAME}` },
      { name: "description", content: "Registro de pedidos com itens, pagamento e status." },
      { property: "og:title", content: `Pedidos — ${STORE_NAME}` },
      { property: "og:description", content: "Registro de pedidos com itens, pagamento e status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(ordersQuery),
      context.queryClient.ensureQueryData(customersQuery),
      context.queryClient.ensureQueryData(productsQuery),
    ]),
  component: OrdersPage,
});

const statusVariant: Record<string, "warning" | "success" | "rose" | "muted" | "danger"> = {
  pendente: "warning",
  pago: "rose",
  enviado: "muted",
  entregue: "success",
  cancelado: "danger",
};

function OrdersPage() {
  const { data: orders } = useSuspenseQuery(ordersQuery);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const today = todayISO();

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Status atualizado");
    },
    onError: () => toast.error("Não foi possível atualizar."),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Pedido excluído");
    },
    onError: () => toast.error("Não foi possível excluir."),
  });

  const q = search.toLowerCase();
  const filtered = orders.filter(
    (o) =>
      o.customers?.name.toLowerCase().includes(q) ||
      o.order_items.some((i) => i.product_name.toLowerCase().includes(q)),
  );

  return (
    <div>
      <PageHeader
        eyebrow="Vendas"
        title="Pedidos"
        description="Registre cada venda — a data da compra inicia o prazo de recompra de 30 dias."
        action={<Button onClick={() => setOpen(true)}><Plus /> Novo pedido</Button>}
      />
      {orders.length === 0 ? (
        <EmptyState title="Nenhum pedido registrado" text="Registre a primeira venda para começar a acompanhar recompras." action={<Button onClick={() => setOpen(true)}><Plus /> Novo pedido</Button>} />
      ) : (
        <>
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por cliente ou produto" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden lg:table-cell">Itens</TableHead>
                  <TableHead className="hidden md:table-cell">Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Recompra</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => {
                  const info = getRepurchaseInfo(o.order_date, today);
                  const repurchased = hasRepurchased(o, orders);
                  return (
                    <TableRow key={o.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(o.order_date)}</TableCell>
                      <TableCell className="font-medium">{o.customers?.name ?? "—"}</TableCell>
                      <TableCell className="hidden max-w-[260px] lg:table-cell">
                        <p className="truncate text-sm text-muted-foreground">
                          {o.order_items.map((i) => `${i.quantity}× ${i.product_name}`).join(", ") || "—"}
                        </p>
                      </TableCell>
                      <TableCell className="hidden text-sm md:table-cell">{labelOf(PAYMENT_METHODS, o.payment_method)}</TableCell>
                      <TableCell>
                        <Select value={o.status} onValueChange={(status) => updateStatus.mutate({ id: o.id, status })}>
                          <SelectTrigger className="h-8 w-[130px] border-none bg-transparent p-0 shadow-none focus:ring-0">
                            <Badge variant={statusVariant[o.status] ?? "muted"}>{labelOf(ORDER_STATUSES, o.status)}</Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map((s) => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {o.status === "cancelado" ? (
                          <span className="text-sm text-muted-foreground">—</span>
                        ) : repurchased ? (
                          <Badge variant="success">Recomprou</Badge>
                        ) : info.status === "alerta" ? (
                          <Badge variant="warning">{info.daysLeft === 0 ? "Vence hoje" : `Faltam ${info.daysLeft}d`}</Badge>
                        ) : info.status === "vencido" ? (
                          <Badge variant="danger">Vencido</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">Até {formatDate(info.dueDate)}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">{brl(o.total)}</TableCell>
                      <TableCell>
                        <ConfirmDelete title="Excluir pedido?" description="O pedido e seus itens serão removidos." onConfirm={() => del.mutate(o.id)} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Novo pedido</DialogTitle>
          </DialogHeader>
          {open && <OrderForm onDone={() => setOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

type ItemDraft = { productId: string; quantity: string; unitPrice: string };

function OrderForm({ onDone }: { onDone: () => void }) {
  const { data: customers } = useSuspenseQuery(customersQuery);
  const { data: products } = useSuspenseQuery(productsQuery);
  const queryClient = useQueryClient();
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [status, setStatus] = useState("pago");
  const [payment, setPayment] = useState("pix");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemDraft[]>([{ productId: "", quantity: "1", unitPrice: "" }]);

  const num = (v: string) => Number(v.replace(",", ".")) || 0;
  const total = items.reduce((s, i) => s + num(i.quantity) * num(i.unitPrice), 0);

  function updateItem(idx: number, patch: Partial<ItemDraft>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  const save = useMutation({
    mutationFn: async () => {
      const valid = items.filter((i) => i.productId && num(i.quantity) > 0);
      const { data: order, error } = await supabase
        .from("orders")
        .insert({ customer_id: customerId, order_date: date, status, payment_method: payment, notes: notes.trim() || null, total })
        .select("id")
        .single();
      if (error) throw error;
      const rows = valid.map((i) => ({
        order_id: order.id,
        product_id: i.productId,
        product_name: products.find((p) => p.id === i.productId)?.name ?? "Produto",
        quantity: Math.round(num(i.quantity)),
        unit_price: num(i.unitPrice),
      }));
      const { error: itemsError } = await supabase.from("order_items").insert(rows);
      if (itemsError) throw itemsError;
      if (status !== "cancelado") {
        for (const r of rows) {
          const p = products.find((x) => x.id === r.product_id);
          if (p) await supabase.from("products").update({ stock: Math.max(0, p.stock - r.quantity) }).eq("id", p.id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Pedido registrado");
      onDone();
    },
    onError: () => toast.error("Não foi possível registrar o pedido."),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!customerId) {
      toast.error("Escolha a cliente.");
      return;
    }
    if (!items.some((i) => i.productId && num(i.quantity) > 0)) {
      toast.error("Adicione ao menos um produto.");
      return;
    }
    save.mutate();
  }

  if (customers.length === 0 || products.length === 0) {
    return (
      <div className="grid gap-3 py-4 text-sm text-muted-foreground">
        <p>Para registrar um pedido, cadastre antes pelo menos uma cliente e um produto.</p>
        <div className="flex gap-2">
          {customers.length === 0 && <Button asChild variant="outline"><Link to="/clientes">Cadastrar cliente</Link></Button>}
          {products.length === 0 && <Button asChild variant="outline"><Link to="/produtos">Cadastrar produto</Link></Button>}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2 sm:col-span-2">
          <Label>Cliente</Label>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger><SelectValue placeholder="Escolha a cliente" /></SelectTrigger>
            <SelectContent>
              {customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="o-date">Data da compra</Label>
          <Input id="o-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label>Pagamento</Label>
          <Select value={payment} onValueChange={setPayment}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3">
        <Label>Produtos</Label>
        {items.map((it, idx) => (
          <div key={idx} className="grid grid-cols-[1fr_70px_100px_auto] items-center gap-2">
            <Select
              value={it.productId}
              onValueChange={(productId) => {
                const p = products.find((x) => x.id === productId);
                updateItem(idx, { productId, unitPrice: p ? String(p.price) : it.unitPrice });
              }}
            >
              <SelectTrigger><SelectValue placeholder="Produto" /></SelectTrigger>
              <SelectContent>
                {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} · {brl(p.price)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input aria-label="Quantidade" type="number" min={1} value={it.quantity} onChange={(e) => updateItem(idx, { quantity: e.target.value })} />
            <Input aria-label="Preço unitário" inputMode="decimal" value={it.unitPrice} onChange={(e) => updateItem(idx, { unitPrice: e.target.value })} placeholder="R$" />
            <Button type="button" variant="ghost" size="icon" aria-label="Remover item" disabled={items.length === 1} onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}>
              <X />
            </Button>
          </div>
        ))}
        <Button type="button" variant="soft" size="sm" className="justify-self-start" onClick={() => setItems((p) => [...p, { productId: "", quantity: "1", unitPrice: "" }])}>
          <Plus /> Adicionar produto
        </Button>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="o-notes">Observações</Label>
        <Textarea id="o-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <DialogFooter className="items-center sm:justify-between">
        <p className="font-display text-2xl font-semibold">Total {brl(total)}</p>
        <Button type="submit" disabled={save.isPending}>{save.isPending ? "Salvando…" : "Registrar pedido"}</Button>
      </DialogFooter>
    </form>
  );
}
