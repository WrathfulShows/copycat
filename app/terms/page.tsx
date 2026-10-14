import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <article className="max-w-2xl py-10">
      <h1 className="text-3xl font-extrabold">Terms of Service</h1>
      <p className="mt-3 text-sm text-neutral-500">Last updated: October 2026. Owner to confirm company details before launch.</p>
      <h2 className="mt-6 text-xl font-bold">The shop</h2>
      <p className="mt-2">Copycat Hair Extensions sells human hair extensions and lashes to customers in IE, GB, DE, FR, ES, IT and NL. All prices are in euro and include VAT at the applicable rate.</p>
      <h2 className="mt-6 text-xl font-bold">Orders and payment</h2>
      <p className="mt-2">An order is placed when you complete checkout and payment on the provider-hosted page. We confirm by email once the payment provider notifies us. If payment fails or is cancelled, no order is created and no charge is made.</p>
      <h2 className="mt-6 text-xl font-bold">Shipping</h2>
      <p className="mt-2">Orders ship within 2 business days. Delivery times and rates are shown at checkout; orders over €150 ship free. See the shipping page for details.</p>
      <h2 className="mt-6 text-xl font-bold">Returns</h2>
      <p className="mt-2">Unopened sets can be returned within 30 days. For hygiene reasons, opened hair and lashes are not returnable unless faulty. See the returns page.</p>
      <h2 className="mt-6 text-xl font-bold">Discounts</h2>
      <p className="mt-2">Discount codes are single-use per order, cannot be combined, and may expire or reach a redemption limit. Totals are always recomputed on our server.</p>
      <h2 className="mt-6 text-xl font-bold">Contact</h2>
      <p className="mt-2">Questions about these terms: use the contact page.</p>
    </article>
  );
}
