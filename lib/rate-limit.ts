/**
 * Fixed-window in-memory rate limiter (module scope: no platform APIs,
 * runs on Node, Netlify and Workers isolates).
 */
const hits = new Map<string, number[]>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): { ok: boolean; retryAfterMs: number } {
  const since = now - windowMs;
  const list = (hits.get(key) ?? []).filter((t) => t > since);
  if (list.length >= limit) {
    return { ok: false, retryAfterMs: list[0] + windowMs - now };
  }
  list.push(now);
  hits.set(key, list);
  return { ok: true, retryAfterMs: 0 };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "local";
}
