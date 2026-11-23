import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BellRing, Package, ShoppingBag, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import logoDark from "@/assets/logo-nature.png.asset.json";
import heroImg from "@/assets/cosmetics-flatlay.jpg";
import { STORE_NAME } from "@/lib/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${STORE_NAME} — Painel de pedidos e recompras` },
      {
        name: "description",
        content:
          "Registre pedidos, produtos e clientes da sua loja de cosméticos e receba alertas de recompra.",
      },
      { property: "og:title", content: `${STORE_NAME} — Painel de pedidos e recompras` },
      {
        property: "og:description",
        content: "Pedidos, clientes, produtos e alertas de recompra em um painel elegante.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  { icon: BellRing, title: "Alertas de recompra", text: "Aviso 10 dias antes do prazo de 30 dias." },
  { icon: ShoppingBag, title: "Pedidos", text: "Registre vendas com itens e pagamento." },
  { icon: Users, title: "Clientes", text: "Histórico e contato rápido pelo WhatsApp." },
  { icon: Package, title: "Produtos", text: "Catálogo com preço e estoque." },
];

function Index() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col justify-between px-6 py-10 sm:px-12 lg:px-16">
        <img
          src={logoDark.url}
          alt={STORE_NAME}
          width={1433}
          height={1049}
          className="h-auto w-40"
        />
        <div className="animate-rise my-12 max-w-lg">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Painel da loja
          </p>
          <h1 className="text-5xl font-semibold leading-[1.05] text-foreground sm:text-6xl">
            Cada cliente, no <em className="text-primary">momento certo</em> de voltar.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Registre pedidos, produtos e clientes, e saiba exatamente quem está perto de precisar
            de uma recompra.
          </p>
          <Button asChild size="lg" className="mt-8 h-12 px-6 shadow-lift">
            <Link to="/dashboard">
              Acessar o painel <ArrowRight />
            </Link>
          </Button>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <li key={f.title} className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <f.icon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="text-sm text-muted-foreground">{f.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="relative hidden lg:block">
        <img
          src={heroImg}
          alt="Produtos de beleza sobre tecido claro com pétalas de peônia"
          width={1024}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </section>
    </main>
  );
}
