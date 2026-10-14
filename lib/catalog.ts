export const CURRENCY = "EUR" as const;

export type HairMethod =
  | "keratin-bonds"
  | "sew-ins"
  | "tapes"
  | "micro-beads"
  | "nano-beads";

export type HairSize = '17"' | '22"';
export type LashStyle = "fairy" | "russian" | "classic";
export type LashSize = "5C" | "5D" | "6C" | "6D";

export interface Shade {
  id: string;
  name: string;
  hex: string;
  /** White-background placeholder image for this shade. */
  image: string;
}

export interface HairProduct {
  kind: "hair";
  id: string;
  method: HairMethod;
  name: string;
  description: string;
  /** Price in minor units (cents) per size. */
  prices: Record<HairSize, number>;
  shades: Shade[];
  /** Colour palette gallery image (2nd image). */
  paletteImage: string;
  categorySlug: string;
  /** Baseline units per variant; overrides keyed `size|shadeId`. */
  defaultStock: number;
  stockOverrides: Record<string, number>;
}

export interface LashProduct {
  kind: "lashes";
  id: string;
  style: LashStyle;
  name: string;
  description: string;
  prices: Record<LashSize, number>;
  image: string;
  categorySlug: string;
  /** Baseline units per size; overrides keyed by size. */
  defaultStock: number;
  stockOverrides: Record<string, number>;
}

export type Product = HairProduct | LashProduct;

export const HAIR_SIZES: HairSize[] = ['17"', '22"'];
export const LASH_SIZES: LashSize[] = ["5C", "5D", "6C", "6D"];

const shadeImage = (file: string) => `/shades/${file}`;
export const PALETTE_IMAGE = "/shades/palette.svg";

export const SHADES: Shade[] = [
  { id: "c1", name: "Jet Black", hex: "#0e0e0e", image: shadeImage("c1.webp") },
  { id: "c1b", name: "Soft Black", hex: "#140d0b", image: shadeImage("c1b.webp") },
  { id: "c2", name: "Dark Brown", hex: "#241611", image: shadeImage("c2.webp") },
  { id: "c4", name: "Espresso", hex: "#2e1a0c", image: shadeImage("c4.webp") },
  { id: "p4-8", name: "Espresso Blend", hex: "#2d1403", image: shadeImage("p4-8.webp") },
  { id: "c6", name: "Chestnut", hex: "#361d0f", image: shadeImage("c6.webp") },
  { id: "p6-24", name: "Chestnut Blend", hex: "#4a2d17", image: shadeImage("p6-24.webp") },
  { id: "p8-16", name: "Warm Cocoa", hex: "#492a09", image: shadeImage("p8-16.webp") },
  { id: "c10", name: "Auburn", hex: "#44200d", image: shadeImage("c10.webp") },
  { id: "p18-18s", name: "Golden Brown", hex: "#5f4024", image: shadeImage("p18-18s.webp") },
  { id: "cc-copper", name: "Copper", hex: "#6e3a19", image: shadeImage("cc-copper.webp") },
  { id: "p10-60", name: "Honey Blend", hex: "#88684c", image: shadeImage("p10-60.webp") },
  { id: "c60a", name: "Platinum Blonde", hex: "#bea587", image: shadeImage("c60a.webp") },
  { id: "c60b", name: "Vanilla Blonde", hex: "#bca78a", image: shadeImage("c60b.webp") },
];

function hairProduct(
  method: HairMethod,
  name: string,
  description: string,
  price17: number,
  price22: number,
  stockOverrides: Record<string, number> = {},
): HairProduct {
  return {
    kind: "hair",
    id: `hair-${method}`,
    method,
    name,
    description,
    prices: { '17"': price17, '22"': price22 },
    shades: SHADES,
    paletteImage: PALETTE_IMAGE,
    categorySlug: `hair-${method}`,
    defaultStock: 25,
    stockOverrides,
  };
}

export const HAIR_PRODUCTS: HairProduct[] = [
  hairProduct(
    "keratin-bonds",
    "Keratin Bond Extensions",
    "Individual keratin-tip strands for discreet, long-lasting length.",
    12900,
    15900,
  ),
  hairProduct(
    "sew-ins",
    "Sew-In Weft Extensions",
    "Sewn wefts for full volume with a secure, flat finish.",
    9900,
    12900,
    { '17"|c1': 0 },
  ),
  hairProduct(
    "tapes",
    "Tape-In Extensions",
    "Lightweight tape panels that blend fast and lie flat.",
    8900,
    11500,
  ),
  hairProduct(
    "micro-beads",
    "Micro Bead Extensions",
    "Bead-secured strands with no heat and easy repositioning.",
    10900,
    13900,
  ),
  hairProduct(
    "nano-beads",
    "Nano Bead Extensions",
    "Extra-small beads for the most discreet strand-by-strand fit.",
    11900,
    14900,
  ),
];

export const LASH_PRODUCTS: LashProduct[] = [
  {
    kind: "lashes",
    id: "lashes-fairy",
    style: "fairy",
    name: "Fairy Lashes",
    description: "Soft, wispy lift for a light everyday flutter.",
    prices: { "5C": 1200, "5D": 1400, "6C": 1400, "6D": 1600 },
    image: "/placeholders/lashes-fairy.svg",
    categorySlug: "lashes-fairy",
    defaultStock: 40,
    stockOverrides: {},
  },
  {
    kind: "lashes",
    id: "lashes-russian",
    style: "russian",
    name: "Russian Volume Lashes",
    description: "Dense, fanned volume for a bold finish.",
    prices: { "5C": 1400, "5D": 1600, "6C": 1600, "6D": 1800 },
    image: "/placeholders/lashes-russian.svg",
    categorySlug: "lashes-russian",
    defaultStock: 40,
    stockOverrides: { "6D": 0 },
  },
  {
    kind: "lashes",
    id: "lashes-classic",
    style: "classic",
    name: "Classic Lashes",
    description: "Clean single-length definition that suits every eye.",
    prices: { "5C": 1000, "5D": 1200, "6C": 1200, "6D": 1400 },
    image: "/placeholders/lashes-classic.svg",
    categorySlug: "lashes-classic",
    defaultStock: 40,
    stockOverrides: {},
  },
];

export const PRODUCTS: Product[] = [...HAIR_PRODUCTS, ...LASH_PRODUCTS];

export const CATEGORIES = [
  ...HAIR_PRODUCTS.map((p) => ({
    slug: `hair/${p.method}`,
    title: p.name,
    blurb: p.description,
    productId: p.id,
  })),
  ...LASH_PRODUCTS.map((p) => ({
    slug: `lashes/${p.style}`,
    title: p.name,
    blurb: p.description,
    productId: p.id,
  })),
] as const;

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

/** Server-side price lookup in minor units. Returns undefined for invalid combos. */
export function priceFor(
  productId: string,
  size: string,
  shadeId?: string,
): number | undefined {
  const product = getProduct(productId);
  if (!product) return undefined;
  if (product.kind === "hair") {
    if (size !== '17"' && size !== '22"') return undefined;
    const shadeOk = product.shades.some((s) => s.id === shadeId);
    if (!shadeOk) return undefined;
    return product.prices[size as HairSize];
  }
  if (!(size in product.prices)) return undefined;
  return product.prices[size as LashSize];
}

/** Baseline stock for a variant (before subtracting reserved quantities). */
export function stockFor(
  productId: string,
  size: string,
  shadeId?: string,
): number | undefined {
  const product = getProduct(productId);
  if (!product) return undefined;
  if (product.kind === "hair") {
    if (size !== '17"' && size !== '22"') return undefined;
    if (!product.shades.some((s) => s.id === shadeId)) return undefined;
    const key = `${size}|${shadeId}`;
    return product.stockOverrides[key] ?? product.defaultStock;
  }
  if (!(size in product.prices)) return undefined;
  return product.stockOverrides[size] ?? product.defaultStock;
}

export function formatEUR(minor: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: CURRENCY,
  }).format(minor / 100);
}
