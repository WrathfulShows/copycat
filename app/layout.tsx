import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CookieConsent } from "@/components/cookie-consent";
import { Analytics } from "@/components/analytics";
import { SITE_NAME, SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Human Hair Extensions & Lashes`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Human hair extensions in keratin bonds, sew-ins, tapes, micro and nano beads, plus fairy, russian and classic lashes.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Human Hair Extensions & Lashes`,
    description:
      "Shop human hair extensions by method, length and shade, plus signature lashes.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-white text-black antialiased">
        <CartProvider>
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
            {children}
          </main>
          <Footer />
          <CookieConsent />
          <Analytics />
        </CartProvider>
      </body>
    </html>
  );
}
