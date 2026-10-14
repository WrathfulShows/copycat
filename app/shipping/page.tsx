import type { Metadata } from "next";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_RATES } from "@/lib/config";
import { formatEUR } from "@/lib/catalog";

export const metadata: Metadata = { title: "Shipping" };

export default function ShippingPage() {
  return (
    <article className="max-w-2xl py-10">
      <h1 className="text-3xl font-extrabold">Shipping</h1>
      <p className="mt-3">Orders ship within 2 business days to IE, GB, DE, FR, ES, IT and NL. Tracked delivery is included on every order.</p>
      <h2 className="mt-6 text-xl font-bold">Rates</h2>
      <ul className="mt-2 list-disc pl-5">
        {Object.entries(SHIPPING_RATES).map(([c, rate]) => (
          <li key={c}>{c}: {formatEUR(rate)}</li>
        ))}
      </ul>
      <p className="mt-2">Orders of {formatEUR(FREE_SHIPPING_THRESHOLD)} or more (after discounts) ship free.</p>
      <h2 className="mt-6 text-xl font-bold">VAT and duties</h2>
      <p className="mt-2">All prices include VAT at the rate applicable in Ireland. For GB orders, any import duties are calculated and shown at checkout before you pay — the price you approve is final.</p>
    </article>
  );
}
