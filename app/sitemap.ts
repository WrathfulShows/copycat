import type { MetadataRoute } from "next";
import { HAIR_PRODUCTS, LASH_PRODUCTS } from "@/lib/catalog";
import { SITE_URL } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const urls: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/hair`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/lashes`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/cart`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/shipping`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/returns`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/privacy`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/terms`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.4 },
  ];
  for (const p of HAIR_PRODUCTS) {
    urls.push({ url: `${base}/hair/${p.method}`, changeFrequency: "weekly", priority: 0.8 });
  }
  for (const p of LASH_PRODUCTS) {
    urls.push({ url: `${base}/lashes/${p.style}`, changeFrequency: "weekly", priority: 0.8 });
  }
  return urls;
}
