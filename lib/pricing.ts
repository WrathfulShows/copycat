import {
  ALLOWED_COUNTRIES,
  FREE_SHIPPING_THRESHOLD,
  LAUNCH_DISCOUNT,
  SHIPPING_RATES,
} from "./config";

export interface PricedLine {
  productId: string;
  name: string;
  size: string;
  shadeId?: string;
  shadeName?: string;
  unitAmount: number;
  quantity: number;
}

export interface Quote {
  subtotal: number;
  discountCode?: string;
  discountAmount: number;
  shippingAmount: number;
  total: number;
}

export class QuoteError extends Error {}

/** Pure order maths: subtotal → discount → shipping → total (minor units). */
export function quote(
  lines: PricedLine[],
  country: string,
  discountCode?: string,
  now: Date = new Date(),
  discountUses: number = 0,
): Quote {
  if (!ALLOWED_COUNTRIES.includes(country)) {
    throw new QuoteError("Country not supported.");
  }
  const subtotal = lines.reduce((s, l) => s + l.unitAmount * l.quantity, 0);
  if (subtotal <= 0) throw new QuoteError("Empty order.");

  let code: string | undefined;
  let discountAmount = 0;
  const raw = (discountCode ?? "").trim().toUpperCase();
  if (raw) {
    if (raw !== LAUNCH_DISCOUNT.code) throw new QuoteError("Unknown discount code.");
    if (now > new Date(LAUNCH_DISCOUNT.expiresAt)) {
      throw new QuoteError("Discount code expired.");
    }
    if (discountUses >= LAUNCH_DISCOUNT.maxUses) {
      throw new QuoteError("Discount code fully redeemed.");
    }
    code = LAUNCH_DISCOUNT.code;
    discountAmount = Math.round((subtotal * LAUNCH_DISCOUNT.percent) / 100);
  }

  const afterDiscount = subtotal - discountAmount;
  const rate = SHIPPING_RATES[country];
  if (rate === undefined) throw new QuoteError("No shipping rate for country.");
  const shippingAmount = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : rate;

  return {
    subtotal,
    discountCode: code,
    discountAmount,
    shippingAmount,
    total: afterDiscount + shippingAmount,
  };
}
