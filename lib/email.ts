import type { Order } from "./orders";

function resendKey(): string | undefined {
  return process.env.RESEND_API_KEY;
}

function fromAddress(): string {
  return process.env.RESEND_FROM ?? "Copycat Hair Extensions <orders@example.com>";
}

function ownerAddress(): string | undefined {
  return process.env.OWNER_EMAIL;
}

async function send(to: string, subject: string, html: string): Promise<void> {
  const key = resendKey();
  if (!key) {
    console.log("[email:dev] to:", to, "subject:", subject);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: fromAddress(), to, subject, html }),
  });
  if (!res.ok) throw new Error(`Resend failed (status ${res.status}).`);
}

function orderTable(order: Order): string {
  const rows = order.lines
    .map(
      (l) =>
        `<tr><td>${l.name}</td><td>${l.size}${l.shadeName ? ` / ${l.shadeName}` : ""}</td><td>${l.quantity}</td><td>€${(l.unitAmount / 100).toFixed(2)}</td></tr>`,
    )
    .join("");
  return `<table border="1" cellpadding="6" cellspacing="0"><tr><th>Item</th><th>Variant</th><th>Qty</th><th>Price</th></tr>${rows}</table>`;
}

function addressBlock(order: Order): string {
  const s = order.shipping;
  return `${s.name}<br>${s.line1}<br>${s.city} ${s.postalCode}<br>${s.country}`;
}

/** Customer confirmation. Called only after the paid webhook. */
export async function sendOrderConfirmation(order: Order): Promise<void> {
  await send(
    order.email,
    `Order confirmed ${order.id}`,
    `<p>Thank you — your payment for order ${order.id} is confirmed.</p>${orderTable(order)}<p>Total: €${(order.total / 100).toFixed(2)}</p><p>Shipping to:<br>${addressBlock(order)}</p>`,
  );
}

/** Owner notification. Called only after the paid webhook. */
export async function sendNewOrderNotification(order: Order): Promise<void> {
  const owner = ownerAddress();
  if (!owner) {
    console.log("[email:dev] new order (no OWNER_EMAIL):", order.id);
    return;
  }
  await send(
    owner,
    `New order ${order.id} — €${(order.total / 100).toFixed(2)}`,
    `<p>New paid order ${order.id} (${order.email}).</p>${orderTable(order)}<p>Discount: ${order.discountCode ?? "none"} (−€${(order.discountAmount / 100).toFixed(2)})<br>Shipping: €${(order.shippingAmount / 100).toFixed(2)}<br>Total: €${(order.total / 100).toFixed(2)}</p><p>Ship to:<br>${addressBlock(order)}</p>`,
  );
}

/** Contact-form message to the owner. */
export async function sendContactMessage(input: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const owner = ownerAddress();
  if (!owner) {
    console.log("[email:dev] contact message (no OWNER_EMAIL):", input.email);
    return;
  }
  await send(
    owner,
    `Contact form: ${input.name}`,
    `<p>From: ${input.name} (${input.email})</p><p>${input.message.replace(/</g, "&lt;")}</p>`,
  );
}
