"use client";

import { useState } from "react";
import type { HairProduct } from "@/lib/catalog";
import { formatEUR, stockFor } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

export function HairBuy({ product }: { product: HairProduct }) {
  const { add } = useCart();
  const [size, setSize] = useState<"17\"" | "22\"">('22"');
  const [shadeId, setShadeId] = useState(product.shades[0].id);
  const [added, setAdded] = useState(false);

  const shade = product.shades.find((s) => s.id === shadeId) ?? product.shades[0];
  const price = product.prices[size];
  const outOfStock = (stockFor(product.id, size, shade.id) ?? 0) <= 0;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <div className="overflow-hidden rounded-3xl border border-[#ececec] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={shade.id}
            src={shade.image}
            alt={`${product.name} in shade ${shade.name}`}
            className="aspect-square w-full object-cover"
            data-testid="main-image"
          />
        </div>
        <div className="mt-3 overflow-hidden rounded-3xl border border-[#ececec] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.paletteImage}
            alt="Full colour palette"
            className="aspect-[5/3] w-full object-cover"
            data-testid="palette-image"
          />
        </div>
      </div>
      <div>
        <h1 className="text-3xl font-extrabold">{product.name}</h1>
        <p className="mt-2 text-neutral-700">{product.description}</p>
        <p className="mt-4 text-2xl font-extrabold" data-testid="price">
          {formatEUR(price)}
        </p>

        <div className="mt-6">
          <p className="font-bold">Length</p>
          <div className="mt-2 flex gap-2" role="radiogroup" aria-label="Length">
            {(Object.keys(product.prices) as Array<"17\"" | "22\"">).map((s) => (
              <button
                key={s}
                role="radio"
                aria-checked={size === s}
                onClick={() => setSize(s)}
                className={`rounded-full px-5 py-2 text-sm font-bold ${
                  size === s ? "bg-black text-white" : "border border-black"
                }`}
              >
                {s} — {formatEUR(product.prices[s])}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="font-bold">
            Shade: <span data-testid="shade-name">{shade.name}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Shade">
            {product.shades.map((s) => {
              const oos = (stockFor(product.id, size, s.id) ?? 0) <= 0;
              return (
                <button
                  key={s.id}
                  role="radio"
                  aria-checked={shadeId === s.id}
                  aria-label={oos ? `${s.name} (out of stock)` : s.name}
                  title={oos ? `${s.name} — out of stock` : s.name}
                  onClick={() => {
                    setShadeId(s.id);
                    setAdded(false);
                  }}
                  className={`h-10 w-10 rounded-full border-2 focus-visible:outline-3 focus-visible:outline-black ${
                    shadeId === s.id ? "border-black ring-2 ring-[#ff6a00]" : "border-neutral-300"
                  } ${oos ? "opacity-30" : ""}`}
                  style={{ background: s.hex }}
                  data-testid={`swatch-${s.id}`}
                />
              );
            })}
          </div>
        </div>

        {outOfStock && (
          <p className="mt-4 rounded-xl bg-black p-3 text-sm font-semibold text-[#ff6a00]" role="status" data-testid="oos-note">
            This length and shade is out of stock. The server also blocks it at checkout.
          </p>
        )}
        <button
          onClick={() => {
            add({
              productId: product.id,
              name: product.name,
              image: shade.image,
              size,
              shadeId: shade.id,
              shadeName: shade.name,
              shadeHex: shade.hex,
              unitAmount: price,
              quantity: 1,
            });
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
