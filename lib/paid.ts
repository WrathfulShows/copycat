import { getStore } from "./orders";
import { sendNewOrderNotification, sendOrderConfirmation } from "./email";

/**
 * Shared paid-webhook handler. Idempotent: replays of the same provider
 * event neither double-mark the order nor double-send emails.
 */
export async function handlePaid(input: {
  provider: string;
  eventId: string;
  orderId: string;
  providerRef?: string;
}): Promise<{ status: "paid" | "missing" | "duplicate" }> {
  const store = getStore();
  const order = await store.getById(input.orderId);
  if (!order) return { status: "missing" };

  const alreadySeen = await store.claimWebhookEvent(
    input.provider,
    input.eventId,
    order.id,
  );
  if (alreadySeen || order.status === "paid") return { status: "duplicate" };

  const paid = await store.markPaid(order.id, input.providerRef);
  if (!paid) return { status: "missing" };
  if (paid.discountCode) {
    await store.recordDiscountUse(paid.discountCode, paid.id);
  }
  // Emails are best-effort: log failures, never fail the webhook.
  try {
    await sendOrderConfirmation(paid);
    await sendNewOrderNotification(paid);
  } catch (e) {
    console.log("[paid] email failed:", e instanceof Error ? e.message : e);
  }
  return { status: "paid" };
}
