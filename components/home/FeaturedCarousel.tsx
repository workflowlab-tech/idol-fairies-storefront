"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";
import { formatPHP } from "@/lib/products/format";
import { getProductPrimaryImage } from "@/lib/products/images";
import { StockBadge } from "@/components/ui/Badge";

export default function FeaturedCarousel({ products }: { products: Product[] }) {
  const [current, setCurrent] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  if (products.length === 0) return null;

  const product = products[current];
  const image = getProductPrimaryImage(product);
  const onSale = product.originalPricePHP !== null && product.originalPricePHP > product.pricePHP;

  function goTo(index: number) {
    setCurrent(Math.max(0, Math.min(index, products.length - 1)));
  }

  function next() {
    setCurrent((prev) => (prev + 1) % products.length);
  }

  function prev() {
    setCurrent((prev) => (prev - 1 + products.length) % products.length);
  }

  return (
    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
      {/* Product Image */}
      <div className="relative flex-1 overflow-hidden rounded-3xl bg-fairy-pink-50">
        <Link href={`/products/${product.slug}`} className="group block overflow-hidden">
          <div className="relative aspect-square w-full">
            <Image
              src={image}
              alt={`${product.artist} ${product.productName}`}
              fill
              sizes="(min-width: 1024px) 50vw, 90vw"
              className="object-cover transition duration-300 group-hover:scale-105"
              priority
            />
            {/* Stock badge overlay */}
            <div className="absolute right-4 top-4">
              {product.stockStatus !== "In Stock" && <StockBadge status={product.stockStatus} />}
            </div>
          </div>
        </Link>

        {/* Previous/Next Controls */}
        <div className="absolute inset-0 flex items-center justify-between px-3">
          <button
            onClick={prev}
            aria-label="Previous product"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-fairy-ink shadow-lg transition hover:bg-white"
          >
            ←
          </button>
          <button
            onClick={next}
            aria-label="Next product"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-fairy-ink shadow-lg transition hover:bg-white"
          >
            →
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 rounded-full transition ${
                index === current ? "w-8 bg-fairy-pink-500" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col gap-4">
        <div>
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-fairy-pink-300">
            Featured
          </span>
          <h2 className="mt-2 text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
            {product.artist}
          </h2>
          <h3 className="mt-1 text-lg font-semibold text-fairy-cream/95">{product.productName}</h3>
          {product.version && <p className="mt-0.5 text-sm text-fairy-cream/70">{product.version}</p>}
        </div>

        {product.shortDescription && (
          <p className="text-sm leading-relaxed text-fairy-cream/80">{product.shortDescription}</p>
        )}

        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold text-white">{formatPHP(product.pricePHP)}</span>
          {onSale && (
            <>
              <span className="text-xs text-fairy-cream/50 line-through">{formatPHP(product.originalPricePHP!)}</span>
              <span className="inline-flex items-center rounded-full bg-fairy-danger/20 px-2.5 py-1 text-xs font-semibold text-fairy-danger">
                Sale
              </span>
            </>
          )}
          {product.stockStatus !== "In Stock" && (
            <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">
              {product.stockStatus}
            </span>
          )}
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="mt-2 inline-flex w-full justify-center rounded-full bg-fairy-pink-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-fairy-pink-400 sm:w-auto"
        >
          View Product →
        </Link>
      </div>
    </div>
  );
}
