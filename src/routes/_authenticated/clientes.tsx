import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import { MessageCircle, Pencil, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app-shell";
import { ConfirmDelete, EmptyState } from "@/components/confirm-delete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { STORE_NAME } from "@/lib/brand";
import { brl, formatDate, whatsappLink } from "@/lib/format";
import { customersQuery, ordersQuery, type Customer } from "@/lib/queries";
import { getRepurchaseInfo, todayISO } from "@/lib/repurchase";

export const Route = createFileRoute("/_authenticated/clientes")({
  head: () => ({
    meta: [
      { title: `Clientes — ${STORE_NAME}` },
      { name: "description", content: "Cadastro de clientes com histórico de compras." },
      { property: "og:title", content: `Clientes — ${STORE_NAME}` },
      { property: "og:description", content: "Cadastro de clientes com histórico de compras." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(customersQuery),
      context.queryClient.ensureQueryData(ordersQuery),
    ]),
  component: CustomersPage,
});

function CustomersPage() {
  const { data: customers } = useSuspenseQuery(customersQuery);
  const { data: orders } = useSuspenseQuery(ordersQuery);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [open, setOpen] = useState(false);
  const today = todayISO();

  const stats = useMemo(() => {
    const m = new Map<string, { count: number; total: number; last: string | null }>();
    for (const o of orders) {
      if (o.status === "cancelado") continue;
      const s = m.get(o.customer_id) ?? { count: 0, total: 0, last: null };
      s.count += 1;
      s.total += Number(o.total);
      if (!s.last || o.order_date > s.last) s.last = o.order_date;
      m.set(o.customer_id, s);
    }
    return m;
  }, [orders]);

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Cliente excluído");
    },
    onError: () => toast.error("Não foi possível excluir."),
  });

  const q = search.toLowerCase();
  const filtered = customers.filter((c) => [c.name, c.phone, c.email].some((v) => v?.toLowerCase().includes(q)));
  const openNew = () => { setEditing(null); setOpen(true); };

  return (
    <div>
      <PageHeader
        eyebrow="Relacionamento"
        title="Clientes"
        description="Suas clientes, com a última compra e o total já gasto."
        action={<Button onClick={openNew}><Plus /> Nova cliente</Button>}
      />
      {customers.length === 0 ? (
        <EmptyState title="Nenhuma cliente cadastrada" text="Cadastre clientes para registrar pedidos e receber alertas de recompra." action={<Button onClick={openNew}><Plus /> Nova cliente</Button>} />
      ) : (
        <>
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por nome, telefone ou e-mail" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Contato</TableHead>
                  <TableHead>Última compra</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Pedidos</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Total gasto</TableHead>
                  <TableHead className="w-32" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => {
                  const s = stats.get(c.id);
                  const info = s?.last ? getRepurchaseInfo(s.last, today) : null;
                  const wa = whatsappLink(c.phone, `Olá, ${c.name.split(" ")[0]}! Aqui é da ${STORE_NAME}.`);
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <p className="font-medium">{c.name}</p>
                        {c.notes && <p className="max-w-[220px] truncate text-xs text-muted-foreground">{c.notes}</p>}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                        <p>{c.phone || "—"}</p>
                        <p className="text-xs">{c.email}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm">{formatDate(s?.last)}</span>
                          {info?.status === "alerta" && <Badge variant="warning">Recompra em {info.daysLeft}d</Badge>}
                          {info?.status === "vencido" && <Badge variant="danger">Prazo vencido</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-right sm:table-cell">{s?.count ?? 0}</TableCell>
                      <TableCell className="hidden text-right sm:table-cell">{brl(s?.total ?? 0)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          {wa && (
                            <Button asChild variant="ghost" size="icon" aria-label="WhatsApp" className="text-success">
                              <a href={wa} target="_blank" rel="noreferrer"><MessageCircle /></a>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => { setEditing(c); setOpen(true); }}><Pencil /></Button>
                          <ConfirmDelete title="Excluir cliente?" description={`${c.name} e todos os pedidos dela serão excluídos.`} onConfirm={() => del.mutate(c.id)} />
                        </div>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{editing ? "Editar cliente" : "Nova cliente"}</DialogTitle>
          </DialogHeader>
          {open && <CustomerForm key={editing?.id ?? "new"} customer={editing} onDone={() => setOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CustomerForm({ customer, onDone }: { customer: Customer | null; onDone: (id?: string) => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: customer?.name ?? "",
    phone: customer?.phone ?? "",
    email: customer?.email ?? "",
    birth_date: customer?.birth_date ?? "",
    notes: customer?.notes ?? "",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        birth_date: form.birth_date || null,
        notes: form.notes.trim() || null,
      };
      if (customer) {
        const { error } = await supabase.from("customers").update(payload).eq("id", customer.id);
        if (error) throw error;
        return customer.id;
      }
      const { data, error } = await supabase.from("customers").insert(payload).select("id").single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(customer ? "Cliente atualizada" : "Cliente cadastrada");
      onDone(id);
    },
    onError: () => toast.error("Não foi possível salvar."),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Informe o nome.");
      return;
    }
    save.mutate();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="c-name">Nome</Label>
        <Input id="c-name" value={form.name} onChange={set("name")} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="c-phone">WhatsApp</Label>
          <Input id="c-phone" value={form.phone} onChange={set("phone")} placeholder="(11) 99999-9999" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="c-email">E-mail</Label>
          <Input id="c-email" type="email" value={form.email} onChange={set("email")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="c-birth">Aniversário</Label>
          <Input id="c-birth" type="date" value={form.birth_date} onChange={set("birth_date")} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="c-notes">Observações</Label>
        <Textarea id="c-notes" value={form.notes} onChange={set("notes")} placeholder="Tipo de pele, preferências…" />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={save.isPending}>{save.isPending ? "Salvando…" : "Salvar"}</Button>
      </DialogFooter>
    </form>
  );
}
