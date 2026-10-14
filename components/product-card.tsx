import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { formatEUR } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  const href =
    product.kind === "hair" ? `/hair/${product.method}` : `/lashes/${product.style}`;
  const img =
    product.kind === "hair" ? product.shades[0].image : product.image;
  const from =
    product.kind === "hair" ? product.prices['17"'] : product.prices["5C"];
  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-2xl border border-[#ececec] bg-white"
    >
      <div className="aspect-square overflow-hidden bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="p-4">
        <p className="font-bold">{product.name}</p>
        <p className="mt-1 text-sm text-neutral-600">
          From {formatEUR(from)}
        </p>
        <span className="btn-signal mt-3 inline-block rounded-full px-4 py-2 text-sm">
          Shop now
        </span>
      </div>
    </Link>
  );
}
