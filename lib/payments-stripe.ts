import Stripe from "stripe";
import type { Order } from "./orders";
import type { HostedPayment, PaymentProvider } from "./payments";
import { requireEnv } from "./payments";

/**
 * Stripe Checkout Sessions adapter (test mode only; sk_test_ keys).
 * Written against current stripe-node docs via Context7:
 * - sessions.create with inline price_data, mode: "payment"
 * - order id in metadata
 * - webhook verified with webhooks.constructEvent (raw body + signature)
 */
export class StripeProvider implements PaymentProvider {
  readonly name = "stripe";
  private stripe: Stripe;

  constructor(secretKey?: string) {
    const key = secretKey ?? process.env.STRIPE_SECRET_KEY ?? "";
    if (!key) throw new Error("Missing required env var: STRIPE_SECRET_KEY");
    if (!key.startsWith("sk_test_")) {
      throw new Error("Refusing live keys: only sk_test_ keys are supported.");
    }
    this.stripe = new Stripe(key);
  }

  async createPayment(
    order: Order,
    opts: { successUrl: string; cancelUrl: string },
  ): Promise<HostedPayment> {
    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      currency: order.currency.toLowerCase(),
      success_url: opts.successUrl,
      cancel_url: opts.cancelUrl,
      metadata: { orderId: order.id },
      line_items: order.lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: order.currency.toLowerCase(),
          unit_amount: l.unitAmount,
          product_data: {
            name: `${l.name} — ${l.size}${l.shadeName ? ` / ${l.shadeName}` : ""}`,
            metadata: { orderId: order.id, productId: l.productId },
          },
        },
      })),
    });
    if (!session.url || !session.id) throw new Error("Stripe did not return a session URL.");
    return { url: session.url, providerRef: session.id };
  }

  /** Verify webhook signature and return the event. Throws on failure. */
  constructEvent(rawBody: string, signature: string): Stripe.Event {
    const secret = requireEnv("STRIPE_WEBHOOK_SECRET");
    return this.stripe.webhooks.constructEvent(rawBody, signature, secret);
  }

  static orderIdFromEvent(event: Stripe.Event): string | undefined {
    const obj = event.data.object as { metadata?: Record<string, string> };
    return obj?.metadata?.orderId;
  }
}
