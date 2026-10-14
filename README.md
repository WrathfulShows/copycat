# Copycat Hair Extensions

Human hair extensions (keratin bonds, sew-ins, tapes, micro beads, nano beads in 17" and 22" with 14 shades) and lashes (fairy, russian, classic in 5C, 5D, 6C, 6D). Next.js App Router + TypeScript + Tailwind, Node 22. Colours: white, black, orange (black text on orange buttons).

## Run

```bash
npm install
cp .env.example .env   # then edit values; never commit .env
npm run dev            # mock payments, in-memory orders
npm run build          # runs preflight first, then next build
npm test               # vitest unit tests
npx playwright test    # e2e (mock purchase + commerce), mobile + desktop
npm run build:worker   # Cloudflare Worker bundle (OpenNext, local only)
```

## Go-live checklist

- [ ] Point `NEXT_PUBLIC_SITE_URL` at the real domain (this flips preflight into launch mode).
- [ ] `PAYMENT_PROVIDER=stripe` (or `dojo`). Mock returns 503 in production.
- [ ] Stripe: `STRIPE_SECRET_KEY=sk_test_…` + `STRIPE_WEBHOOK_SECRET=…`; register `…/api/webhooks/stripe`. Only `sk_test_` keys accepted.
- [ ] Dojo: `DOJO_SECRET_KEY=…` + `DOJO_WEBHOOK_SECRET=…`; subscribe `…/api/webhooks/dojo` to `payment_intent.status_updated`.
- [ ] `DATABASE_URL=…` (Neon/Postgres). Apply `migrations/001_orders.sql`. Without it, orders stay in memory and vanish on restart.
- [ ] `RESEND_API_KEY=…`, `RESEND_FROM=…` (your sending domain), `OWNER_EMAIL=…` (new-order + contact mail). Without them, emails only log.
- [ ] Analytics IDs (`NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_ADS_ID`, `NEXT_PUBLIC_META_PIXEL_ID`) — optional; pixels load only after cookie consent, purchase fires only on webhook-confirmed `paid`.
- [ ] Confirm with the owner: company details in Terms, VAT treatment (prices currently shown VAT-inclusive), GB duty handling, support email, discount code/expiry/limit in `lib/config.ts`, stock numbers in `lib/catalog.ts`.
- [ ] `PREFLIGHT` must pass: `npm run build` on the launch domain fails on mock provider, missing env, missing policy pages, or incomplete catalog variants.
- [ ] Deploy target: Netlify (`netlify.toml` provided — run `netlify link` then `netlify deploy`, needs owner approval) or Cloudflare Workers (`npm run build:worker`, `wrangler.jsonc` provided).

## What you must supply (nothing real is in this repo)

`DATABASE_URL`, `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` **or** `DOJO_SECRET_KEY`/`DOJO_WEBHOOK_SECRET`, `RESEND_API_KEY`, `RESEND_FROM`, `OWNER_EMAIL`, analytics IDs, company/VAT details. I will not push, deploy, or use real keys without your explicit go-ahead.

## Accepted risks / notes

- `npm audit` shows 9 high-severity findings, all transitive build-tooling deps of `@opennextjs` (glob via `@node-minify`); fixable only with breaking `--force` downgrades, so left pinned. None ship to the browser.
- Rate limiting is in-memory per isolate (fine on Node/Netlify; approximate on Workers).
- Netlify local validation is `netlify build --dry` + passing `next build`; a real `netlify build` needs a linked site (owner step).
