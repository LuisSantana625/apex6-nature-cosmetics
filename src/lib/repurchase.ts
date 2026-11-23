/** Prazo de recompra: dias após a data da compra. */
export const REPURCHASE_DAYS = 30;
/** O alerta começa quando faltam estes dias (ou menos) para o prazo. */
export const ALERT_WINDOW_DAYS = 10;

export type RepurchaseStatus = "em_dia" | "alerta" | "vencido";

const DAY_MS = 86_400_000;

function toUtcMs(iso: string): number {
  const [y = 1970, m = 1, d = 1] = iso.slice(0, 10).split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUtcMs(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Data de hoje (fuso local) no formato AAAA-MM-DD. */
export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function daysBetween(fromISO: string, toISO: string): number {
  return Math.round((toUtcMs(toISO) - toUtcMs(fromISO)) / DAY_MS);
}

export function addDays(iso: string, days: number): string {
  return fromUtcMs(toUtcMs(iso) + days * DAY_MS);
}

export interface RepurchaseInfo {
  daysSince: number;
  daysLeft: number;
  dueDate: string;
  alertStartDate: string;
  status: RepurchaseStatus;
}

export function getRepurchaseInfo(orderDate: string, today: string): RepurchaseInfo {
  const daysSince = daysBetween(orderDate, today);
  const daysLeft = REPURCHASE_DAYS - daysSince;
  const status: RepurchaseStatus =
    daysLeft < 0 ? "vencido" : daysLeft <= ALERT_WINDOW_DAYS ? "alerta" : "em_dia";
  return {
    daysSince,
    daysLeft,
    dueDate: addDays(orderDate, REPURCHASE_DAYS),
    alertStartDate: addDays(orderDate, REPURCHASE_DAYS - ALERT_WINDOW_DAYS),
    status,
  };
}

interface OrderLike {
  id: string;
  customer_id: string;
  order_date: string;
  created_at?: string;
  status?: string;
}

/**
 * Uma linha por cliente: a compra mais recente (não cancelada) define o ciclo.
 * Uma nova compra do cliente reinicia o prazo de 30 dias.
 */
export function buildRepurchaseList<O extends OrderLike>(
  orders: O[],
  today: string,
): Array<O & RepurchaseInfo> {
  const latest = new Map<string, O>();
  for (const o of orders) {
    if (o.status === "cancelado") continue;
    const cur = latest.get(o.customer_id);
    if (
      !cur ||
      o.order_date > cur.order_date ||
      (o.order_date === cur.order_date && (o.created_at ?? "") > (cur.created_at ?? ""))
    ) {
      latest.set(o.customer_id, o);
    }
  }
  return [...latest.values()]
    .map((o) => ({ ...o, ...getRepurchaseInfo(o.order_date, today) }))
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

/** Pedido já foi seguido de outra compra do mesmo cliente? */
export function hasRepurchased(order: OrderLike, orders: OrderLike[]): boolean {
  return orders.some(
    (o) =>
      o.id !== order.id &&
      o.customer_id === order.customer_id &&
      o.status !== "cancelado" &&
      (o.order_date > order.order_date ||
        (o.order_date === order.order_date && (o.created_at ?? "") > (order.created_at ?? ""))),
  );
}
