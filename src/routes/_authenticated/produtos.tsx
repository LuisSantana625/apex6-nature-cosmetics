import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Pencil, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app-shell";
import { ConfirmDelete, EmptyState } from "@/components/confirm-delete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { STORE_NAME } from "@/lib/brand";
import { brl } from "@/lib/format";
import { productsQuery, type Product } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/produtos")({
  head: () => ({
    meta: [
      { title: `Produtos — ${STORE_NAME}` },
      { name: "description", content: "Catálogo de produtos com preço e estoque." },
      { property: "og:title", content: `Produtos — ${STORE_NAME}` },
      { property: "og:description", content: "Catálogo de produtos com preço e estoque." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: ProductsPage,
});

function ProductsPage() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto excluído");
    },
    onError: () => toast.error("Não foi possível excluir."),
  });

  const q = search.toLowerCase();
  const filtered = products.filter((p) =>
    [p.name, p.brand, p.category].some((v) => v?.toLowerCase().includes(q)),
  );

  return (
    <div>
      <PageHeader
        eyebrow="Catálogo"
        title="Produtos"
        description="Cadastre os cosméticos que você vende, com preço e estoque."
        action={
          <Button onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus /> Novo produto
          </Button>
        }
      />
      {products.length === 0 ? (
        <EmptyState
          title="Nenhum produto cadastrado"
          text="Adicione seus produtos para usá-los nos pedidos."
          action={<Button onClick={() => { setEditing(null); setOpen(true); }}><Plus /> Novo produto</Button>}
        />
      ) : (
        <>
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar produto, marca ou categoria" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="hidden sm:table-cell">Marca</TableHead>
                  <TableHead className="hidden md:table-cell">Categoria</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Estoque</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{p.brand || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell">{p.category ? <Badge variant="rose">{p.category}</Badge> : "—"}</TableCell>
                    <TableCell className="text-right">{brl(p.price)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={p.stock === 0 ? "danger" : p.stock <= 3 ? "warning" : "muted"}>{p.stock} un.</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => { setEditing(p); setOpen(true); }}>
                          <Pencil />
                        </Button>
                        <ConfirmDelete title="Excluir produto?" description={`"${p.name}" será removido do catálogo.`} onConfirm={() => del.mutate(p.id)} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
      <ProductDialog open={open} onOpenChange={setOpen} product={editing} />
    </div>
  );
}

function ProductDialog({ open, onOpenChange, product }: { open: boolean; onOpenChange: (o: boolean) => void; product: Product | null }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{product ? "Editar produto" : "Novo produto"}</DialogTitle>
        </DialogHeader>
        {open && <ProductForm key={product?.id ?? "new"} product={product} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function ProductForm({ product, onDone }: { product: Product | null; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: product?.name ?? "",
    brand: product?.brand ?? "",
    category: product?.category ?? "",
    price: product ? String(product.price) : "",
    stock: product ? String(product.stock) : "0",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        brand: form.brand.trim() || null,
        category: form.category.trim() || null,
        price: Number(form.price.replace(",", ".")) || 0,
        stock: Math.max(0, parseInt(form.stock) || 0),
      };
      const { error } = product
        ? await supabase.from("products").update(payload).eq("id", product.id)
        : await supabase.from("products").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(product ? "Produto atualizado" : "Produto cadastrado");
      onDone();
    },
    onError: () => toast.error("Não foi possível salvar."),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Informe o nome do produto.");
      return;
    }
    save.mutate();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="p-name">Nome</Label>
        <Input id="p-name" value={form.name} onChange={set("name")} placeholder="Ex.: Sérum de vitamina C" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="p-brand">Marca</Label>
          <Input id="p-brand" value={form.brand} onChange={set("brand")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="p-cat">Categoria</Label>
          <Input id="p-cat" value={form.category} onChange={set("category")} placeholder="Skincare, Maquiagem…" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="p-price">Preço (R$)</Label>
          <Input id="p-price" inputMode="decimal" value={form.price} onChange={set("price")} placeholder="0,00" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="p-stock">Estoque</Label>
          <Input id="p-stock" type="number" min={0} value={form.stock} onChange={set("stock")} />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={save.isPending}>{save.isPending ? "Salvando…" : "Salvar"}</Button>
      </DialogFooter>
    </form>
  );
}
