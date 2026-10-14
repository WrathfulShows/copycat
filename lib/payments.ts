import type { Order } from "./orders";

export interface HostedPayment {
  /** URL the browser should be redirected to. */
  url: string;
  /** Provider-side reference (session id / payment intent id). */
  providerRef: string;
}

export interface PaymentProvider {
  readonly name: string;
  /** Create a hosted payment for an already-persisted pending order. */
  createPayment(order: Order, opts: { successUrl: string; cancelUrl: string }): Promise<HostedPayment>;
}

export type DojoHttp = (
  url: string,
  init: { method: string; headers: Record<string, string>; body?: string },
) => Promise<{ status: number; json: () => Promise<unknown> }>;

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}
