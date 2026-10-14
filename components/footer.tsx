import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[#ececec] bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="text-lg font-extrabold">Copycat Hair Extensions</p>
          <p className="mt-2 max-w-xs text-sm text-neutral-600">
            Human hair extensions by method, length and shade, plus signature lashes.
          </p>
        </div>
        <nav className="text-sm" aria-label="Shop">
          <p className="font-bold">Shop</p>
          <ul className="mt-2 space-y-1">
            <li><Link href="/hair/keratin-bonds" className="hover:underline">Keratin bonds</Link></li>
            <li><Link href="/hair/sew-ins" className="hover:underline">Sew-ins</Link></li>
            <li><Link href="/hair/tapes" className="hover:underline">Tapes</Link></li>
            <li><Link href="/hair/micro-beads" className="hover:underline">Micro beads</Link></li>
            <li><Link href="/hair/nano-beads" className="hover:underline">Nano beads</Link></li>
            <li><Link href="/lashes" className="hover:underline">Lashes</Link></li>
          </ul>
        </nav>
        <nav className="text-sm" aria-label="Help">
          <p className="font-bold">Help</p>
          <ul className="mt-2 space-y-1">
            <li><Link href="/shipping" className="hover:underline">Shipping</Link></li>
            <li><Link href="/returns" className="hover:underline">Returns</Link></li>
            <li><Link href="/privacy" className="hover:underline">Privacy</Link></li>
            <li><Link href="/terms" className="hover:underline">Terms</Link></li>
            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
