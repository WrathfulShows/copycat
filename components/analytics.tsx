"use client";

import { useEffect } from "react";

const KEY = "cc-cookie-consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

function consented(): boolean {
  try {
    return localStorage.getItem(KEY) === "accepted";
  } catch {
    return false;
  }
}

function load(src: string): void {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  document.head.appendChild(s);
}

/** GA4 + Google Ads + Meta Pixel. Loads only after cookie consent. */
export function Analytics() {
  useEffect(() => {
    const enable = () => {
      if (!consented()) return;
      const ga = process.env.NEXT_PUBLIC_GA4_ID;
      const ads = process.env.NEXT_PUBLIC_ADS_ID;
      const meta = process.env.NEXT_PUBLIC_META_PIXEL_ID;
      if (ga) {
        load(`https://www.googletagmanager.com/gtag/js?id=${ga}`);
        window.dataLayer = window.dataLayer ?? [];
        window.gtag = window.gtag ?? ((...a: unknown[]) => window.dataLayer?.push(a));
        window.gtag("js", new Date());
        window.gtag("config", ga);
        if (ads) window.gtag("config", ads);
      }
      if (meta) {
        load("https://connect.facebook.net/en_US/fbevents.js");
        window.fbq = window.fbq ?? ((...a: unknown[]) => (window.fbq as unknown as { q: unknown[] }).q?.push(a));
        window.fbq("init", meta);
        window.fbq("track", "PageView");
      }
    };
    enable();
    window.addEventListener("cc-consent", enable);
    return () => window.removeEventListener("cc-consent", enable);
  }, []);
  return null;
}

/** Fire a purchase event. Call only after the webhook confirms payment. */
export function trackPurchase(orderId: string, totalMinor: number): void {
  if (!consented()) return;
  try {
    window.gtag?.("event", "purchase", {
      transaction_id: orderId,
      value: totalMinor / 100,
      currency: "EUR",
    });
    window.fbq?.("track", "Purchase", { value: totalMinor / 100, currency: "EUR" });
  } catch {
    /* ignore */
  }
}
