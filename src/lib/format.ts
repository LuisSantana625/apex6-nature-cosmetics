const brlFmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const brl = (n: number | string | null | undefined) => brlFmt.format(Number(n ?? 0));

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export function whatsappLink(phone: string | null | undefined, message: string): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (!digits.startsWith("55") || digits.length <= 11) digits = `55${digits}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export const ORDER_STATUSES = [
  { value: "pendente", label: "Pendente" },
  { value: "pago", label: "Pago" },
  { value: "enviado", label: "Enviado" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
] as const;

export const PAYMENT_METHODS = [
  { value: "pix", label: "Pix" },
  { value: "credito", label: "Cartão de crédito" },
  { value: "debito", label: "Cartão de débito" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "boleto", label: "Boleto" },
] as const;

export const labelOf = (
  list: ReadonlyArray<{ value: string; label: string }>,
  value: string | null | undefined,
) => list.find((i) => i.value === value)?.label ?? value ?? "—";
