import { describe, expect, it } from "vitest";
import { QuoteError, quote } from "./pricing";
import { FREE_SHIPPING_THRESHOLD, LAUNCH_DISCOUNT, SHIPPING_RATES } from "./config";

const line = (unitAmount: number, quantity = 1) => ({
  productId: "hair-tapes",
  name: "Tape-In Extensions",
  size: '22"' as const,
  unitAmount,
  quantity,
});

describe("pricing quote", () => {
  it("adds per-country shipping below the free threshold", () => {
    const q = quote([line(8900)], "IE");
    expect(q).toMatchObject({
      subtotal: 8900,
      discountAmount: 0,
      shippingAmount: SHIPPING_RATES.IE,
      total: 8900 + SHIPPING_RATES.IE,
    });
  });

  it("ships free at or above the threshold", () => {
    const q = quote([line(FREE_SHIPPING_THRESHOLD)], "DE");
    expect(q.shippingAmount).toBe(0);
    expect(q.total).toBe(FREE_SHIPPING_THRESHOLD);
  });

  it("applies the launch discount and re-evaluates free shipping", () => {
    const subtotal = 20000;
    const q = quote([line(subtotal)], "IE", LAUNCH_DISCOUNT.code.toLowerCase(), new Date("2026-11-01"), 0);
    const expected = Math.round((subtotal * LAUNCH_DISCOUNT.percent) / 100);
    expect(q.discountCode).toBe(LAUNCH_DISCOUNT.code);
    expect(q.discountAmount).toBe(expected);
    const after = subtotal - expected;
    expect(q.shippingAmount).toBe(after >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATES.IE);
    expect(q.total).toBe(after + q.shippingAmount);
  });

  it("rejects unknown, expired and over-limit codes", () => {
    expect(() => quote([line(20000)], "IE", "NOPE")).toThrow(QuoteError);
    expect(() =>
      quote([line(20000)], "IE", LAUNCH_DISCOUNT.code, new Date("2028-01-01"), 0),
    ).toThrow(/expired/);
    expect(() =>
      quote([line(20000)], "IE", LAUNCH_DISCOUNT.code, new Date("2026-11-01"), LAUNCH_DISCOUNT.maxUses),
    ).toThrow(/redeemed/);
  });

  it("rejects unsupported countries and empty orders", () => {
    expect(() => quote([line(100)], "US")).toThrow(QuoteError);
    expect(() => quote([], "IE")).toThrow(QuoteError);
  });
});
