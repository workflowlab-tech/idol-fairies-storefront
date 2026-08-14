"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Product } from "@/types/product";
import ProductCard from "@/components/products/ProductCard";

export default function ProductSlideshow({
  title,
  subtitle,
  viewAllHref,
  products,
}: {
  title: string;
  subtitle?: string;
  viewAllHref: string;
  products: Product[];
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  function scrollBy(amount: number) {
    rowRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-fairy-ink sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-fairy-ink/60">{subtitle}</p>}
        </div>
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <button
            aria-label="Scroll left"
            onClick={() => scrollBy(-320)}
            className="rounded-full border border-fairy-pink-200 p-2 text-fairy-ink/60 hover:bg-fairy-pink-50"
          >
            ←
          </button>
          <button
            aria-label="Scroll right"
            onClick={() => scrollBy(320)}
            className="rounded-full border border-fairy-pink-200 p-2 text-fairy-ink/60 hover:bg-fairy-pink-50"
          >
            →
          </button>
          <Link href={viewAllHref} className="ml-2 text-sm font-semibold text-fairy-pink-600 hover:underline">
            View all
          </Link>
        </div>
      </div>

      <div ref={rowRef} className="snap-row">
        {products.map((product) => (
          <div key={product.slug} className="w-[45vw] sm:w-56">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <Link href={viewAllHref} className="mt-3 block text-center text-sm font-semibold text-fairy-pink-600 sm:hidden">
        View all →
      </Link>
    </section>
  );
}
