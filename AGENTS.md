# AGENTS.md — Copycat Hair Extensions

## Brand
- Name: Copycat Hair Extensions
- Products: human hair extensions + lashes. Layout ideas ONLY from foxylocks.com and hickenbick-hair.com. Do NOT copy their text, images, or branding.
- Colours: white, black, orange. Black text on orange buttons for contrast.

## Stack
- Next.js (App Router), TypeScript, Tailwind, Node 22.
- Currency EUR, amounts in minor units. Prices include VAT (owner to confirm).

## Source of truth
- `lib/catalog.ts` is the ONLY source of truth for products/prices/stock.
  - Hair: keratin bonds, sew-ins, tapes, micro beads, nano beads. Sizes 17" and 22" (own price each) + 14 shades with real photos (`/shades/*.webp`). Shade choice swaps main image; 2nd gallery image is the palette SVG. Swatches built from hex. OOS variants exist (e.g. sew-ins 17"/Jet Black).
  - Lashes: fairy, russian, classic. Sizes 5C, 5D, 6C, 6D. No shades (russian 6D OOS).
  - `stockFor()` gives baseline stock; server subtracts reserved units from the order store.
- `lib/config.ts`: allowed countries, per-country shipping rates, free-shipping threshold, launch discount (code/expiry/maxUses), provider selection.
- `lib/pricing.ts`: pure subtotal → discount → shipping → total quote (shared client/server).
- Cart: React context + localStorage; line = product + size + shade.

## Checkout / payments (provider-agnostic)
- Form shows server-authoritative breakdown (subtotal, discount, shipping, total) before payment.
- `POST /api/checkout` (nodejs runtime, rate-limited): Zod-validate, recompute every price server-side from `catalog.ts`, block OOS (409) and bad/expired/over-limit codes (400), create `pending` order via `getStore()`, return hosted payment URL.
- Only provider webhooks mark orders `paid`, via idempotent `handlePaid()` (event-claim table + paid short-circuit; emails sent once). Success page only reads status; pixels fire `purchase` only on confirmed `paid`.
- `lib/payments.ts`: `PaymentProvider` interface, `PAYMENT_PROVIDER=mock|stripe|dojo`. Mock 503s in production. Stripe test-mode only. Dojo never run live.
- Fail closed: missing env vars refuse checkout. Never add payment-provider MCP.

## Orders / email / secrets
- `lib/orders.ts`: `OrderStore` (create, getById, markPaid, attachProviderRef, reserved, claimWebhookEvent, discount uses). Postgres via `@neondatabase/serverless` (fetch-based, portable) when `DATABASE_URL` set; console dev store fallback. Schema in `migrations/001_orders.sql`.
- `lib/email.ts`: Resend via fetch (confirmation + owner new-order + contact). Triggered only by paid webhooks; dev logs without key.
- Never read, print, or commit `.env`. `.env*` in `.gitignore`. Provide `.env.example`.

## SEO / pages / marketing
- Pages: home, category, product, cart, checkout, success/cancel, shipping/returns/privacy/terms, contact, cookie consent. Cart/checkout/success/cancel/mock-pay are noindexed.
- SEO: `sitemap.ts`, `robots.ts`, per-page metadata + OpenGraph (+ `opengraph-image`), Product JSON-LD, `not-found`/`error` pages.
- `GET /feed.xml`: Merchant feed, one item per variant, prices/availability matching pages exactly.
- GA4/Ads/Meta load only after cookie consent.

## Tooling / quality gates
- MCPs (pinned, no @latest, ONLY these): Context7, Playwright, GitHub, Next.js DevTools, shadcn. No payment MCP. Ask before installing anything else.
- Skill: `frontend-design` from anthropics/skills.
- `scripts/preflight.ts` runs before every build: fails on mock-in-production, missing env, missing policy pages, incomplete variants, secrets in client bundle.
- Security: CSP + HSTS/nosniff/referrer/frame headers, rate limits on checkout + contact, Zod everywhere, webhook signature verify. `npm audit`: 9 high transitives accepted (opennext build tooling, pinned).
- Portability: no fs writes, no platform APIs; Stripe routes pinned to nodejs runtime. `netlify.toml` + OpenNext Cloudflare (`open-next.config.ts`, `wrangler.jsonc`); both builds verified locally, never deploy without approval.
- Done when: build (+preflight) passes; vitest + Playwright (mobile+desktop) pass; worker build passes. Finish with README manual TODOs.
- Before any git push, deploy, or real payment key use: ask first.
