import Image from "next/image";
import Link from "next/link";

const SHOP_LINKS = [
  { href: "/shop", label: "All Products" },
  { href: "/albums", label: "Albums" },
  { href: "/light-sticks", label: "Light Sticks" },
  { href: "/photobooks", label: "Photobooks & Magazines" },
  { href: "/preorders", label: "Preorders" },
];

const HELP_LINKS = [
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About / Why Idol Fairies" },
  { href: "/faq#shipping", label: "Shipping (PH)" },
  { href: "/faq#returns", label: "Returns & Refunds" },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-fairy-pink-100 bg-fairy-ink text-fairy-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <span className="relative block h-11 w-11 overflow-hidden rounded-2xl bg-white/5">
              <Image src="/idol-fairies-logo.jpg" alt="Idol Fairies PH" fill sizes="44px" className="object-cover" />
            </span>
            <span className="font-extrabold tracking-tight">
              Idol<span className="text-fairy-pink-300">Fairies</span> PH
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-fairy-cream/70">
            A modern K-pop e-commerce storefront for albums, light sticks, photobooks, and magazines — shipped from
            the Philippines.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-fairy-pink-300">Shop</h3>
          <ul className="mt-3 space-y-2 text-sm text-fairy-cream/80">
            {SHOP_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-fairy-pink-200">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-fairy-blue-300">Help</h3>
          <ul className="mt-3 space-y-2 text-sm text-fairy-cream/80">
            {HELP_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-fairy-blue-200">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-fairy-cream/60">Idol AI</h3>
          <p className="mt-3 text-sm text-fairy-cream/80">
            Have a question about an album, a preorder, or shipping? Tap the floating Idol AI button anywhere on the
            site — it answers in your language.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-fairy-cream/50 sm:px-6">
        Idol Fairies PH is a demo K-pop storefront portfolio project. Product data sourced for catalog reference only.
      </div>
    </footer>
  );
}
