import { neon } from "@neondatabase/serverless";

export type OrderStatus = "pending" | "paid" | "cancelled";

export interface OrderLine {
  productId: string;
  name: string;
  size: string;
  shadeId?: string;
  shadeName?: string;
  unitAmount: number;
  quantity: number;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  email: string;
  shipping: ShippingAddress;
  lines: OrderLine[];
  subtotal: number;
  discountCode?: string;
  discountAmount: number;
  shippingAmount: number;
  /** Total in minor units (EUR cents). */
  total: number;
  currency: "EUR";
  status: OrderStatus;
  provider: string;
  providerRef?: string;
  createdAt: string;
}

export interface OrderStore {
  create(order: Omit<Order, "id" | "createdAt" | "status">): Promise<Order>;
  getById(id: string): Promise<Order | undefined>;
  markPaid(id: string, providerRef?: string): Promise<Order | undefined>;
  attachProviderRef(orderId: string, providerRef: string): Promise<void>;
  /** Units in pending/paid orders for a variant (excludes cancelled). */
  reserved(productId: string, size: string, shadeId?: string): Promise<number>;
  /** True when the webhook event was already processed (replay guard). */
  claimWebhookEvent(provider: string, eventId: string, orderId: string): Promise<boolean>;
  countDiscountUses(code: string): Promise<number>;
  recordDiscountUse(code: string, orderId: string): Promise<void>;
}

function log(...args: unknown[]) {
  console.log("[orders]", ...args);
}

// ---------------------------------------------------------------------------
// In-memory dev store (fallback when DATABASE_URL is unset). Keeps the
// console-logging behaviour for local dev and tests.
// ---------------------------------------------------------------------------
const memory = new Map<string, Order>();
const byProviderRef = new Map<string, string>();
const webhookEvents = new Set<string>();
const discountUses: { code: string; orderId: string }[] = [];

function rowToOrder(row: Order): Order {
  return row;
}

export const devStore: OrderStore = {
  async create(order) {
    const id = `ord_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const saved: Order = {
      ...order,
      id,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    memory.set(id, saved);
    log("created", saved.id, saved.total, saved.currency);
    return rowToOrder(saved);
  },
  async getById(id) {
    const direct = memory.get(id);
    if (direct) return direct;
    const mapped = byProviderRef.get(id);
    return mapped ? memory.get(mapped) : undefined;
  },
  async markPaid(id, providerRef) {
    const resolvedId = memory.has(id) ? id : (byProviderRef.get(id) ?? id);
    const order = memory.get(resolvedId);
    if (!order) return undefined;
    if (order.status === "paid") return order;
    const paid: Order = { ...order, status: "paid", providerRef };
    memory.set(resolvedId, paid);
    if (providerRef) byProviderRef.set(providerRef, resolvedId);
    log("paid", paid.id, providerRef ?? "");
    return paid;
  },
  async attachProviderRef(orderId, providerRef) {
    const order = memory.get(orderId);
    if (!order) return;
    memory.set(orderId, { ...order, providerRef });
    byProviderRef.set(providerRef, orderId);
  },
  async reserved(productId, size, shadeId) {
    let n = 0;
    for (const o of memory.values()) {
      if (o.status === "cancelled") continue;
      for (const l of o.lines) {
        if (
          l.productId === productId &&
          l.size === size &&
          (l.shadeId ?? undefined) === (shadeId ?? undefined)
        ) {
          n += l.quantity;
        }
      }
    }
    return n;
  },
  async claimWebhookEvent(provider, eventId) {
    const key = `${provider}:${eventId}`;
    if (webhookEvents.has(key)) return true;
    webhookEvents.add(key);
    return false;
  },
  async countDiscountUses(code) {
    return discountUses.filter((u) => u.code === code).length;
  },
  async recordDiscountUse(code, orderId) {
    if (!discountUses.some((u) => u.orderId === orderId)) {
      discountUses.push({ code, orderId });
    }
  },
};

/** Record the provider-side reference for an order. */
export async function attachProviderRef(orderId: string, providerRef: string) {
  return getStore().attachProviderRef(orderId, providerRef);
}

// ---------------------------------------------------------------------------
// Postgres store (Neon serverless: plain fetch, runs on Node, Netlify and
// Cloudflare Workers). Schema in migrations/001_orders.sql.
// ---------------------------------------------------------------------------
function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Missing required env var: DATABASE_URL");
  return neon(url);
}

function toOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    email: row.email as string,
    shipping: row.shipping as ShippingAddress,
    lines: row.lines as OrderLine[],
    subtotal: Number(row.subtotal),
    discountCode: (row.discount_code as string) ?? undefined,
    discountAmount: Number(row.discount_amount),
    shippingAmount: Number(row.shipping_amount),
    total: Number(row.total),
    currency: "EUR",
    status: row.status as OrderStatus,
    provider: row.provider as string,
    providerRef: (row.provider_ref as string) ?? undefined,
    createdAt: (row.created_at as Date).toISOString(),
  };
}

export const pgStore: OrderStore = {
  async create(order) {
    const db = sql();
    const id = `ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const createdAt = new Date().toISOString();
    await db`
      INSERT INTO orders (id, email, shipping, lines, subtotal, discount_code, discount_amount, shipping_amount, total, currency, status, provider, created_at)
      VALUES (${id}, ${order.email}, ${JSON.stringify(order.shipping)}, ${JSON.stringify(order.lines)}, ${order.subtotal}, ${order.discountCode ?? null}, ${order.discountAmount}, ${order.shippingAmount}, ${order.total}, 'EUR', 'pending', ${order.provider}, ${createdAt})
    `;
    for (const l of order.lines) {
      await db`
        INSERT INTO order_lines (order_id, product_id, size, shade_id, quantity)
        VALUES (${id}, ${l.productId}, ${l.size}, ${l.shadeId ?? null}, ${l.quantity})
      `;
    }
    log("created", id, order.total, order.currency);
    const rows = await db`SELECT * FROM orders WHERE id = ${id}`;
    return toOrder(rows[0] as Record<string, unknown>);
  },
  async getById(id) {
    const db = sql();
    const rows = await db`
      SELECT * FROM orders WHERE id = ${id} OR provider_ref = ${id}
      LIMIT 1
    `;
    if (rows.length === 0) return undefined;
    return toOrder(rows[0] as Record<string, unknown>);
  },
  async markPaid(id, providerRef) {
    const db = sql();
    const existing = await this.getById(id);
    if (!existing) return undefined;
    if (existing.status === "paid") return existing;
    await db`
      UPDATE orders SET status = 'paid', provider_ref = COALESCE(${providerRef ?? null}, provider_ref)
      WHERE id = ${existing.id} AND status <> 'paid'
    `;
    log("paid", existing.id, providerRef ?? "");
    const updated = await this.getById(existing.id);
    return updated;
  },
  async attachProviderRef(orderId, providerRef) {
    const db = sql();
    await db`UPDATE orders SET provider_ref = ${providerRef} WHERE id = ${orderId}`;
  },
  async reserved(productId, size, shadeId) {
    const db = sql();
    const rows = await db`
      SELECT COALESCE(SUM(l.quantity), 0) AS n FROM order_lines l
      JOIN orders o ON o.id = l.order_id
      WHERE o.status IN ('pending', 'paid')
        AND l.product_id = ${productId} AND l.size = ${size}
        AND COALESCE(l.shade_id, '') = COALESCE(${shadeId ?? null}, '')
    `;
    return Number((rows[0] as { n: string }).n);
  },
  async claimWebhookEvent(provider, eventId, orderId) {
    const db = sql();
    try {
      await db`
        INSERT INTO webhook_events (provider, event_id, order_id)
        VALUES (${provider}, ${eventId}, ${orderId})
      `;
      return false;
    } catch {
      return true; // already processed
    }
  },
  async countDiscountUses(code) {
    const db = sql();
    const rows = await db`SELECT COUNT(*) AS n FROM discount_uses WHERE code = ${code}`;
    return Number((rows[0] as { n: string }).n);
  },
  async recordDiscountUse(code, orderId) {
    const db = sql();
    await db`
      INSERT INTO discount_uses (code, order_id) VALUES (${code}, ${orderId})
      ON CONFLICT (order_id) DO NOTHING
    `;
  },
};

/** Postgres when DATABASE_URL is set, otherwise the console dev store. */
export function getStore(): OrderStore {
  return process.env.DATABASE_URL ? pgStore : devStore;
}
