import type { Metadata } from "next";

export const metadata: Metadata = { title: "Returns" };

export default function ReturnsPage() {
  return (
    <article className="max-w-2xl py-10">
      <h1 className="text-3xl font-extrabold">Returns</h1>
      <p className="mt-3">Unopened sets can be returned within 30 days for a refund.</p>
      <p className="mt-2">For hygiene reasons, opened hair and lashes cannot be resold and are not returnable unless faulty.</p>
    </article>
  );
}
