/**
 * Launch preflight. Runs before `next build` (see package.json).
 * Fails the build when launch-blocking problems are found.
 *
 * Production heuristic: a non-localhost NEXT_PUBLIC_SITE_URL means launch.
 * Local builds (localhost) skip the production-only gates.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { HAIR_PRODUCTS, LASH_PRODUCTS } from "../lib/catalog";
import { LAUNCH_DISCOUNT } from "../lib/config";

const ROOT = join(import.meta.dirname, "..");
const failures: string[] = [];
const fail = (msg: string) => failures.push(msg);

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const isLaunch = !/localhost|127\.0\.0\.1/.test(siteUrl);
const provider = (process.env.PAYMENT_PROVIDER ?? "mock").toLowerCase();

// 1. Production must not run the mock provider.
if (isLaunch && provider === "mock") {
  fail("PAYMENT_PROVIDER=mock on a launch site. Set stripe or dojo.");
}

// 2. Required env vars.
const requiredByProvider: Record<string, string[]> = {
  stripe: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
  dojo: ["DOJO_SECRET_KEY", "DOJO_WEBHOOK_SECRET"],
  mock: [],
};
const requiredLaunch = ["NEXT_PUBLIC_SITE_URL", "DATABASE_URL", "RESEND_API_KEY", "OWNER_EMAIL"];
for (const name of requiredByProvider[provider] ?? []) {
  if (!process.env[name]) fail(`Missing env var for ${provider}: ${name}.`);
}
if (isLaunch) {
  for (const name of requiredLaunch) {
    if (!process.env[name]) fail(`Missing launch env var: ${name}.`);
  }
  if (
    provider === "stripe" &&
    process.env.STRIPE_SECRET_KEY &&
    !process.env.STRIPE_SECRET_KEY.startsWith("sk_test_")
  ) {
    fail("Only sk_test_ Stripe keys are supported.");
  }
}

// 3. Policy pages must exist.
for (const page of ["shipping", "returns", "privacy", "terms"]) {
  if (!existsSync(join(ROOT, "app", page, "page.tsx"))) {
    fail(`Missing policy page: app/${page}/page.tsx.`);
  }
}

// 4. Every catalog variant needs a price, an image and a palette image.
const publicDir = join(ROOT, "public");
for (const p of HAIR_PRODUCTS) {
  for (const size of Object.keys(p.prices)) {
    if (!(p.prices[size as keyof typeof p.prices] > 0)) {
      fail(`No price: ${p.id} ${size}.`);
    }
  }
  for (const shade of p.shades) {
    if (!existsSync(join(publicDir, shade.image.replace(/^\//, "")))) {
      fail(`Missing shade image file: ${shade.image}.`);
    }
  }
  if (!existsSync(join(publicDir, p.paletteImage.replace(/^\//, "")))) {
    fail(`Missing palette image file: ${p.paletteImage}.`);
  }
}
for (const p of LASH_PRODUCTS) {
  for (const size of Object.keys(p.prices)) {
    if (!(p.prices[size as keyof typeof p.prices] > 0)) {
      fail(`No price: ${p.id} ${size}.`);
    }
  }
  if (!existsSync(join(publicDir, p.image.replace(/^\//, "")))) {
    fail(`Missing lash image file: ${p.image}.`);
  }
}

// 5. Discount config sanity.
if (!(LAUNCH_DISCOUNT.percent > 0 && LAUNCH_DISCOUNT.percent < 100)) {
  fail("LAUNCH_DISCOUNT.percent must be 1–99.");
}
if (Number.isNaN(Date.parse(LAUNCH_DISCOUNT.expiresAt))) {
  fail("LAUNCH_DISCOUNT.expiresAt is not a date.");
}

// 6. No server-only secrets in the client bundle (when .next exists).
const serverOnly = ["STRIPE_SECRET_KEY", "DOJO_SECRET_KEY", "DOJO_WEBHOOK_SECRET", "RESEND_API_KEY", "DATABASE_URL", "STRIPE_WEBHOOK_SECRET"];
const staticDir = join(ROOT, ".next", "static");
if (existsSync(staticDir)) {
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
    );
  for (const file of walk(staticDir).filter((f) => f.endsWith(".js"))) {
    const content = readFileSync(file, "utf8");
    for (const name of serverOnly) {
      if (content.includes(name)) fail(`Secret name ${name} found in client bundle ${file}.`);
    }
  }
} else {
  console.log("preflight: no .next/static yet, skipping client-bundle secret scan.");
}

if (failures.length > 0) {
  console.error("preflight FAILED:");
  for (const f of failures) console.error(` - ${f}`);
  process.exit(1);
}
console.log(`preflight ok (site: ${siteUrl}, provider: ${provider}).`);
