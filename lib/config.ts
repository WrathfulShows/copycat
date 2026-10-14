export const SITE_NAME = "Copycat Hair Extensions";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const CURRENCY = "EUR";

/** ISO country codes allowed for shipping. Configurable here. */
export const ALLOWED_COUNTRIES = ["IE", "GB", "DE", "FR", "ES", "IT", "NL"];

/** Flat shipping rate per country, in minor units (EUR cents). */
export const SHIPPING_RATES: Record<string, number> = {
  IE: 490,
  GB: 690,
  DE: 590,
  FR: 590,
  ES: 590,
  IT: 590,
  NL: 590,
};

/** Discounted subtotal at or above this (minor units) ships free. */
export const FREE_SHIPPING_THRESHOLD = 15000;

/** Launch discount. Usage is counted in the order store (paid orders). */
export const LAUNCH_DISCOUNT = {
  code: "LAUNCH10",
  percent: 10,
  expiresAt: "2027-06-30T23:59:59Z",
  maxUses: 500,
} as const;

export type PaymentProviderName = "mock" | "stripe" | "dojo";

export function paymentProvider(): PaymentProviderName {
  const v = (process.env.PAYMENT_PROVIDER ?? "mock").toLowerCase();
  if (v === "stripe" || v === "dojo" || v === "mock") return v;
  return "mock";
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Production heuristic for preflight: a non-localhost site URL means launch. */
export function isLaunchSite(): boolean {
  return !/localhost|127\.0\.0\.1/.test(SITE_URL);
}
