import { describe, expect, it, vi } from "vitest";
import {
  DojoProvider,
  buildDojoSignature,
  parseDojoWebhook,
  verifyDojoSignature,
  DOJO_API_BASE,
} from "./payments-dojo";
import type { Order } from "./orders";

function order(): Order {
  return {
    id: "ord_test123",
    email: "a@example.com",
    shipping: { name: "A", line1: "1", city: "Dublin", postalCode: "D01", country: "IE" },
    lines: [],
    subtotal: 11500,
    discountAmount: 0,
    shippingAmount: 0,
    total: 11500,
    currency: "EUR",
    status: "pending",
    provider: "dojo",
    createdAt: new Date().toISOString(),
  };
}

describe("dojo adapter", () => {
  it("creates a payment intent with Basic auth + Version header and returns paymentLink", async () => {
    const http = vi.fn(async (url: string, init: { headers: Record<string, string>; body?: string }) => {
      expect(url).toBe(`${DOJO_API_BASE}/payment-intents`);
      expect(init.headers.Authorization).toBe("Basic sk_sandbox_test");
      expect(init.headers.Version).toBeTruthy();
      const body = JSON.parse(init.body ?? "{}");
      expect(body.amount).toEqual({ value: 11500, currencyCode: "EUR" });
      expect(body.reference).toBe("ord_test123");
      expect(body.config.redirectUrl).toContain("/success");
      return {
        status: 200,
        json: async () => ({ id: "pi_test_1", paymentLink: "https://pay.dojo.tech/checkout/pi_test_1" }),
      };
    });
    const provider = new DojoProvider("sk_sandbox_test", http);
    const res = await provider.createPayment(order(), {
      successUrl: "http://localhost:3000/success?order=ord_test123",
      cancelUrl: "http://localhost:3000/cancel?order=ord_test123",
    });
    expect(res).toEqual({ url: "https://pay.dojo.tech/checkout/pi_test_1", providerRef: "pi_test_1" });
  });

  it("falls back to pay.dojo.tech URL when paymentLink missing", async () => {
    const http = vi.fn(async () => ({ status: 200, json: async () => ({ id: "pi_x" }) }));
    const provider = new DojoProvider("k", http);
    const res = await provider.createPayment(order(), { successUrl: "s", cancelUrl: "c" });
    expect(res.url).toBe("https://pay.dojo.tech/checkout/pi_x");
  });

  it("throws on non-2xx", async () => {
    const http = vi.fn(async () => ({ status: 401, json: async () => ({}) }));
    await expect(
      new DojoProvider("k", http).createPayment(order(), { successUrl: "s", cancelUrl: "c" }),
    ).rejects.toThrow();
  });

  it("builds and verifies dojo-signature round-trip", () => {
    const raw = '{"id":"evt_1","event":"payment_intent.created"}';
    const sig = buildDojoSignature(raw, "secret123");
    expect(sig.startsWith("sha256=")).toBe(true);
    expect(verifyDojoSignature(raw, "secret123", sig)).toBe(true);
    expect(verifyDojoSignature(raw, "wrong", sig)).toBe(false);
    expect(verifyDojoSignature(raw, "secret123", null)).toBe(false);
  });

  it("parses webhook payload and rejects invalid", () => {
    const raw = JSON.stringify({
      id: "evt_1",
      event: "payment_intent.status_updated",
      accountId: "acc_test",
      createdAt: "2024-07-25T08:49:24.761Z",
      data: { paymentIntentId: "pi_1", paymentStatus: "Captured", captureMode: "Auto" },
    });
    expect(parseDojoWebhook(raw).data.paymentStatus).toBe("Captured");
    expect(() => parseDojoWebhook("{}")).toThrow();
  });
});
