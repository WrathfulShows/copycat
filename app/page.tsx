import type { Metadata } from "next";
import Link from "next/link";
import { HAIR_PRODUCTS, LASH_PRODUCTS, SHADES } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { SITE_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Human Hair Extensions & Lashes`,
  description:
    "Human hair extensions by method, length and shade, plus fairy, russian and classic lashes.",
  openGraph: {
    title: `${SITE_NAME} — Human Hair Extensions & Lashes`,
    description: "Pick your method, length and shade. Lashes in 5C, 5D, 6C, 6D.",
  },
};

export default function Home() {
  return (
    <div className="pb-16">
      {/* Hero: length comparison is the memorable moment */}
      <section className="grid gap-8 py-10 sm:py-14 lg:grid-cols-[1.1fr_1fr] lg:items-end">
        <div>
          <h1 className="text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl">
            Length, measured in inches. Colour, matched to you.
          </h1>
          <p className="mt-4 max-w-md text-base text-neutral-700 sm:text-lg">
            Human hair extensions in five methods and fourteen shades. Choose 17 or 22
            inches, then pick the shade that disappears into your own hair.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/hair/tapes" className="btn-signal rounded-full px-6 py-3 text-base">
              Shop extensions
            </Link>
            <Link
              href="/lashes"
              className="rounded-full border-2 border-black px-6 py-3 text-base font-bold"
            >
              Shop lashes
            </Link>
          </div>
        </div>
        <div className="flex items-end justify-center gap-6 rounded-3xl border border-[#ececec] bg-white p-8" aria-hidden="true">
          <div className="text-center">
            <div className="mx-auto w-10 rounded-t-full bg-black" style={{ height: 170 }} />
            <p className="mt-3 text-5xl font-extrabold">17&Prime;</p>
            <p className="text-sm text-neutral-600">collarbone</p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-10 rounded-t-full bg-[#ff6a00]" style={{ height: 220 }} />
            <p className="mt-3 text-5xl font-extrabold">22&Prime;</p>
            <p className="text-sm text-neutral-600">waist</p>
          </div>
        </div>
      </section>

      <section aria-label="Shop by method">
        <h2 className="text-2xl font-extrabold">Shop extensions by method</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HAIR_PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section aria-label="Shop lashes" className="mt-12">
        <h2 className="text-2xl font-extrabold">Lashes</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {LASH_PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section aria-label="Shades" className="mt-12 rounded-3xl bg-black p-6 text-white sm:p-10">
        <h2 className="text-2xl font-extrabold">Fourteen shades, one palette</h2>
        <p className="mt-2 max-w-lg text-sm text-neutral-300">
          Every extension photo is shot on the same hanger against white, so the colour
          you see is the colour you get. The second gallery image is always the full palette.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {SHADES.map((s) => (
            <span
              key={s.id}
              title={s.name}
              className="h-9 w-9 rounded-full border-2 border-white"
              style={{ background: s.hex }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
