import { describe, expect, it } from "vitest";
import { priceFor, stockFor, getProduct, SHADES } from "../lib/catalog";

describe("catalog", () => {
  it("prices 17 and 22 separately per hair method", () => {
    expect(priceFor("hair-tapes", '17"', "c1")).toBe(8900);
    expect(priceFor("hair-tapes", '22"', "c1")).toBe(11500);
  });

  it("rejects unknown shade and size", () => {
    expect(priceFor("hair-tapes", '17"', "nope")).toBeUndefined();
    expect(priceFor("hair-tapes", '20"', "c1")).toBeUndefined();
    expect(priceFor("nope", '17"', "c1")).toBeUndefined();
  });

  it("prices lashes without shades", () => {
    expect(priceFor("lashes-fairy", "5C")).toBe(1200);
    expect(priceFor("lashes-fairy", "6D")).toBe(1600);
    expect(priceFor("lashes-fairy", "XX")).toBeUndefined();
  });

  it("has 14 shades with images and hex swatches", () => {
    expect(SHADES).toHaveLength(14);
    for (const s of SHADES) {
      expect(s.image).toMatch(/^\/shades\//);
      expect(s.hex).toMatch(/^#[0-9a-f]{6}$/i);
    }
    expect(getProduct("hair-tapes")?.kind).toBe("hair");
  });

  it("reports baseline stock and out-of-stock variants", () => {
    expect(stockFor("hair-tapes", '22"', "c1")).toBeGreaterThan(0);
    expect(stockFor("hair-sew-ins", '17"', "c1")).toBe(0);
    expect(stockFor("lashes-russian", "6D")).toBe(0);
    expect(stockFor("lashes-russian", "5C")).toBeGreaterThan(0);
    expect(stockFor("nope", '17"', "c1")).toBeUndefined();
  });
});
