"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CartLine {
  key: string;
  productId: string;
  name: string;
  image: string;
  size: string;
  shadeId?: string;
  shadeName?: string;
  shadeHex?: string;
  unitAmount: number;
  quantity: number;
}

interface CartCtx {
  lines: CartLine[];
  add: (line: Omit<CartLine, "key">) => void;
  remove: (key: string) => void;
  clear: () => void;
  total: number;
  count: number;
}

const Ctx = createContext<CartCtx | null>(null);

const STORAGE_KEY = "cc-cart-v1";

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() =>
    typeof window === "undefined" ? [] : load(),
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines, ready]);

  const value = useMemo<CartCtx>(() => {
    const add: CartCtx["add"] = (line) => {
      const key = `${line.productId}|${line.size}|${line.shadeId ?? "noshade"}`;
      setLines((prev) => {
        const existing = prev.find((l) => l.key === key);
        if (existing) {
          return prev.map((l) =>
            l.key === key ? { ...l, quantity: l.quantity + line.quantity } : l,
          );
        }
        return [...prev, { ...line, key }];
      });
    };
    const remove: CartCtx["remove"] = (key) =>
      setLines((prev) => prev.filter((l) => l.key !== key));
    const clear = () => setLines([]);
    const total = lines.reduce((s, l) => s + l.unitAmount * l.quantity, 0);
    const count = lines.reduce((s, l) => s + l.quantity, 0);
    return { lines, add, remove, clear, total, count };
  }, [lines]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
