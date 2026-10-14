"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

const NAV = [
  { href: "/hair/keratin-bonds", label: "Keratin Bonds" },
  { href: "/hair/sew-ins", label: "Sew-Ins" },
  { href: "/hair/tapes", label: "Tapes" },
  { href: "/hair/micro-beads", label: "Micro Beads" },
  { href: "/hair/nano-beads", label: "Nano Beads" },
  { href: "/lashes", label: "Lashes" },
];

export function Header() {
  const { count } = useCart();
  return (
    <header className="border-b border-[#ececec] bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          Copycat<span className="bg-[#ff6a00] px-1">Hair</span>
        </Link>
        <nav className="hidden flex-wrap items-center gap-4 text-sm font-medium lg:flex" aria-label="Primary">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:underline">
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/cart"
          className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
          aria-label={`Cart, ${count} items`}
        >
          Cart ({count})
        </Link>
      </div>
      <nav className="flex gap-3 overflow-x-auto px-4 pb-3 text-sm font-medium lg:hidden" aria-label="Primary mobile">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-full border border-[#ececec] px-3 py-1">
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
