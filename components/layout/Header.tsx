"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart/context";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/albums", label: "Albums" },
  { href: "/light-sticks", label: "Light Sticks" },
  { href: "/photobooks", label: "Photobooks & Mags" },
  { href: "/shop?category=Collectable", label: "Collectibles" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-fairy-pink-100 bg-fairy-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Idol Fairies home">
          <span className="relative block h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-fairy-ink shadow-sm">
            <Image src="/idol-fairies-logo.jpg" alt="Idol Fairies" fill sizes="44px" className="object-cover" />
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-extrabold tracking-tight text-fairy-ink">
              Idol<span className="text-fairy-pink-500">Fairies</span>
            </span>
            <span className="text-[11px] font-medium uppercase tracking-widest text-fairy-blue-600">
              K-pop Store
            </span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-fairy-ink/80 transition hover:bg-fairy-pink-100 hover:text-fairy-pink-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/search"
            className="rounded-full p-2 text-fairy-ink/70 transition hover:bg-fairy-pink-100 hover:text-fairy-pink-700"
            aria-label="Search"
          >
            <SearchIcon />
          </Link>
          <Link
            href="/cart"
            className="relative rounded-full p-2 text-fairy-ink/70 transition hover:bg-fairy-pink-100 hover:text-fairy-pink-700"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
          >
            <CartIcon />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-fairy-pink-500 px-1 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            className="rounded-full p-2 text-fairy-ink/70 hover:bg-fairy-pink-100 lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-fairy-pink-100 px-4 py-3 lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-fairy-ink/80 hover:bg-fairy-pink-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path
        d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}
