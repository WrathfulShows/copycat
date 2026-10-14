import { describe, expect, it } from "vitest";
import { StripeProvider } from "./payments-stripe";

describe("stripe adapter", () => {
  it("refuses missing keys (fail closed)", () => {
    expect(() => new StripeProvider("")).toThrow(/STRIPE_SECRET_KEY/);
  });

  it("refuses live keys (test mode only)", () => {
    expect(() => new StripeProvider("sk_live_abc")).toThrow(/sk_test_/);
  });

  it("extracts order id from event metadata", () => {
    const event = {
      data: { object: { metadata: { orderId: "ord_123" } } },
    } as never;
    expect(StripeProvider.orderIdFromEvent(event)).toBe("ord_123");
  });
});
