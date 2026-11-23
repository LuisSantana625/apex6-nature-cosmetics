import { describe, expect, it } from "vitest";
import { buildRepurchaseList, getRepurchaseInfo } from "./repurchase";

describe("alerta de recompra (prazo de 30 dias, alerta nos últimos 10)", () => {
  it("19 dias após a compra ainda não alerta (faltam 11)", () => {
    const info = getRepurchaseInfo("2026-01-01", "2026-01-20");
    expect(info.daysLeft).toBe(11);
    expect(info.status).toBe("em_dia");
  });

  it("20 dias após a compra entra em alerta (faltam 10)", () => {
    const info = getRepurchaseInfo("2026-01-01", "2026-01-21");
    expect(info.daysLeft).toBe(10);
    expect(info.status).toBe("alerta");
  });

  it("no 30º dia o prazo vence hoje e continua em alerta", () => {
    const info = getRepurchaseInfo("2026-01-01", "2026-01-31");
    expect(info.daysLeft).toBe(0);
    expect(info.status).toBe("alerta");
    expect(info.dueDate).toBe("2026-01-31");
  });

  it("depois de 30 dias fica vencido", () => {
    expect(getRepurchaseInfo("2026-01-01", "2026-02-01").status).toBe("vencido");
  });

  it("o alerta começa 10 dias antes do prazo", () => {
    expect(getRepurchaseInfo("2026-01-01", "2026-01-01").alertStartDate).toBe("2026-01-21");
  });

  it("uma nova compra do cliente reinicia o prazo", () => {
    const list = buildRepurchaseList(
      [
        { id: "a", customer_id: "c1", order_date: "2026-01-01" },
        { id: "b", customer_id: "c1", order_date: "2026-01-25" },
      ],
      "2026-01-28",
    );
    expect(list).toHaveLength(1);
    expect(list[0]?.id).toBe("b");
    expect(list[0]?.status).toBe("em_dia");
  });

  it("pedidos cancelados não contam como compra", () => {
    const list = buildRepurchaseList(
      [
        { id: "a", customer_id: "c1", order_date: "2026-01-01" },
        { id: "b", customer_id: "c1", order_date: "2026-01-20", status: "cancelado" },
      ],
      "2026-01-25",
    );
    expect(list[0]?.id).toBe("a");
    expect(list[0]?.status).toBe("alerta");
  });
});
