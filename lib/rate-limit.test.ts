import { describe, expect, it } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rate limiter", () => {
  it("allows up to the limit then blocks within the window", () => {
    const key = `t-${Date.now()}`;
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    expect(rateLimit(key, 3, 60_000).ok).toBe(false);
  });

  it("resets after the window passes", () => {
    const key = `w-${Date.now()}`;
    rateLimit(key, 1, 100, 1_000);
    expect(rateLimit(key, 1, 100, 1_099).ok).toBe(false);
    expect(rateLimit(key, 1, 100, 1_101).ok).toBe(true);
  });
});
