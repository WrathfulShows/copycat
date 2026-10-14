import { createHmac, timingSafeEqual } from "node:crypto";
import type { Order } from "./orders";
import type { DojoHttp, HostedPayment, PaymentProvider } from "./payments";
import { requireEnv } from "./payments";

/**
 * Dojo Payment Intents adapter (from docs.dojo.tech; never run live here).
 * - Auth: `Authorization: Basic <api_key>` (literal prefix, not base64).
 * - `Version: 2024-02-05`, JSON body, amounts in minor units.
 * - Creates a payment intent with reference = order id and
 *   config.redirectUrl, returns paymentLink as hosted URL.
 * - Webhooks: `payment_intent.status_updated` with `dojo-signature` header
 *   (HMAC-SHA256 over raw body, `sha256=AA-BB-…` uppercase dash format).
 */

export const DOJO_API_BASE = "https://api.dojo.tech";
export const DOJO_API_VERSION = "2024-02-05";

export interface DojoPaymentIntent {
  id: string;
  status: string;
  paymentLink?: string;
  paymentMethods?: string[];
  amount?: { value: number; currencyCode: string };
  reference?: string;
}

export interface DojoWebhookEvent {
  id: string;
  event: string;
  accountId: string;
  createdAt: string;
  data: {
    paymentIntentId: string;
    paymentStatus: string;
    captureMode?: string;
  };
}

const defaultHttp: DojoHttp = async (url, init) => {
  const res = await fetch(url, {
    method: init.method,
    headers: init.headers,
    body: init.body,
  });
  return { status: res.status, json: () => res.json() as Promise<unknown> };
};

export class DojoProvider implements PaymentProvider {
  readonly name = "dojo";
  private http: DojoHttp;

  constructor(
    private apiKey?: string,
    http?: DojoHttp,
  ) {
    this.http = http ?? defaultHttp;
  }

  private key(): string {
    return this.apiKey ?? requireEnv("DOJO_SECRET_KEY");
  }

  async createPayment(
    order: Order,
    opts: { successUrl: string; cancelUrl: string },
  ): Promise<HostedPayment> {
    void opts.cancelUrl;
    if (order.currency !== "EUR") throw new Error("Dojo adapter: unsupported currency.");
    const res = await this.http(`${DOJO_API_BASE}/payment-intents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${this.key()}`,
        Version: DOJO_API_VERSION,
      },
      body: JSON.stringify({
        amount: { value: order.total, currencyCode: "EUR" },
        reference: order.id,
        description: `Copycat order ${order.id}`,
        config: { redirectUrl: opts.successUrl },
      }),
    });
    if (res.status < 200 || res.status >= 300) {
      throw new Error(`Dojo create payment intent failed (status ${res.status}).`);
    }
    const data = (await res.json()) as DojoPaymentIntent;
    if (!data.id) throw new Error("Dojo response missing payment intent id.");
    const url = data.paymentLink ?? `https://pay.dojo.tech/checkout/${data.id}`;
    return { url, providerRef: data.id };
  }

  async getPaymentIntent(id: string): Promise<DojoPaymentIntent> {
    const res = await this.http(`${DOJO_API_BASE}/payment-intents/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${this.key()}`,
        Version: DOJO_API_VERSION,
      },
    });
    if (res.status !== 200) throw new Error(`Dojo lookup failed (status ${res.status}).`);
    return (await res.json()) as DojoPaymentIntent;
  }
}

/** Format per Dojo docs: `sha256=` + uppercase hex bytes joined with `-`. */
export function buildDojoSignature(rawBody: Uint8Array | string, secret: string): string {
  const digest = createHmac("sha256", secret).update(rawBody).digest();
  return `sha256=${[...digest].map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join("-")}`;
}

export function verifyDojoSignature(
  rawBody: Uint8Array | string,
  secret: string,
  header: string | null | undefined,
): boolean {
  if (!header) return false;
  const expected = buildDojoSignature(rawBody, secret);
  const a = Buffer.from(header, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function parseDojoWebhook(raw: string): DojoWebhookEvent {
  const data = JSON.parse(raw) as DojoWebhookEvent;
  if (!data?.event || !data?.data?.paymentIntentId) {
    throw new Error("Invalid Dojo webhook payload.");
  }
  return data;
}
