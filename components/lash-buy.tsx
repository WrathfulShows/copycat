"use client";

import { useState } from "react";
import type { LashProduct } from "@/lib/catalog";
import { formatEUR, stockFor } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

export function LashBuy({ product }: { product: LashProduct }) {
  const { add } = useCart();
  const [size, setSize] = useState<"5C" | "5D" | "6C" | "6D">("5C");
  const [added, setAdded] = useState(false);
  const price = product.prices[size];
  const outOfStock = (stockFor(product.id, size) ?? 0) <= 0;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="overflow-hidden rounded-3xl border border-[#ececec] bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" data-testid="main-image" />
      </div>
      <div>
        <h1 className="text-3xl font-extrabold">{product.name}</h1>
        <p className="mt-2 text-neutral-700">{product.description}</p>
        <p className="mt-4 text-2xl font-extrabold" data-testid="price">{formatEUR(price)}</p>
        <div className="mt-6">
          <p className="font-bold">Size</p>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
            {(Object.keys(product.prices) as Array<"5C" | "5D" | "6C" | "6D">).map((s) => {
              const oos = (stockFor(product.id, s) ?? 0) <= 0;
              return (
                <button
                  key={s}
                  role="radio"
                  aria-checked={size === s}
                  aria-label={oos ? `${s} (out of stock)` : s}
                  onClick={() => {
                    setSize(s);
                    setAdded(false);
                  }}
                  className={`rounded-full px-5 py-2 text-sm font-bold focus-visible:outline-3 focus-visible:outline-black ${
                    size === s ? "bg-black text-white" : "border border-black"
                  } ${oos ? "opacity-40" : ""}`}
                  data-testid={`size-${s}`}
                >
                  {s}{oos ? " (sold out)" : ""}
                </button>
              );
            })}
          </div>
        </div>
        {outOfStock && (
          <p className="mt-4 rounded-xl bg-black p-3 text-sm font-semibold text-[#ff6a00]" role="status" data-testid="oos-note">
            This size is out of stock. The server also blocks it at checkout.
          </p>
        )}
        <button
          onClick={() => {
            add({ productId: product.id, name: product.name, image: product.image, size, unitAmount: price, quantity: 1 });
            setAdded(true);
          }}
          disabled={outOfStock}
          className="btn-signal mt-8 w-full rounded-full px-6 py-4 text-lg disabled:opacity-40"
          data-testid="add-to-cart"
        >
          {outOfStock ? "Out of stock" : "Add to cart"}
        </button>
        {added && (
          <p className="mt-2 text-sm font-semibold" role="status">
            Added. <a href="/cart" className="underline">Go to cart</a>
          </p>
        )}
      </div>
    </div>
  );
}
