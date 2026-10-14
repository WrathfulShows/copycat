import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <article className="max-w-2xl py-10">
      <h1 className="text-3xl font-extrabold">Privacy</h1>
      <p className="mt-3">We store your email and shipping address only to fulfil your order. Order confirmation emails are sent by our email provider.</p>
      <h2 className="mt-6 text-xl font-bold">Payments</h2>
      <p className="mt-2">Payments are processed by our payment provider on their hosted pages; we never see your card details.</p>
      <h2 className="mt-6 text-xl font-bold">Cookies and measurement</h2>
      <p className="mt-2">Strictly necessary cookies keep the cart and checkout working. Analytics and advertising pixels (Google Analytics, Google Ads, Meta) load only if you accept cookies in the banner, and the purchase event is recorded only after payment is confirmed. Rejecting keeps the shop fully working.</p>
      <h2 className="mt-6 text-xl font-bold">Your rights</h2>
      <p className="mt-2">Ask for a copy or deletion of your data any time via the contact page.</p>
    </article>
  );
}
