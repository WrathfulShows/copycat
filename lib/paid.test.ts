import { describe, expect, it } from "vitest";
import { devStore } from "./orders";
import { handlePaid } from "./paid";

describe("paid webhook idempotency", () => {
  it("marks paid once; replays return duplicate without double effects", async () => {
    const order = await devStore.create({
      email: "a@example.com",
      shipping: { name: "A", line1: "1", city: "Dublin", postalCode: "D01", country: "IE" },
      lines: [],
      subtotal: 10000,
      discountAmount: 0,
      shippingAmount: 490,
      total: 10490,
      currency: "EUR",
      provider: "mock",
    });
    const input = { provider: "mock", eventId: `evt-${Date.now()}`, orderId: order.id, providerRef: "mock_x" };
    expect(await handlePaid(input)).toMatchObject({ status: "paid" });
    expect(await handlePaid(input)).toMatchObject({ status: "duplicate" });
    const stored = await devStore.getById(order.id);
    expect(stored?.status).toBe("paid");
  });

  it("returns missing for unknown orders", async () => {
    expect(
      await handlePaid({ provider: "mock", eventId: "e1", orderId: "ord_nope" }),
    ).toMatchObject({ status: "missing" });
  });
});
