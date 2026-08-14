import { Suspense, type ReactNode } from "react";
import ProductFilterBar from "./ProductFilterBar";
import ProductGrid from "./ProductGrid";
import type { Product } from "@/types/product";

const FILTER_BAR_FALLBACK = (
  <div className="h-[54px] animate-pulse rounded-2xl border border-fairy-pink-100 bg-white lg:h-[46px]" />
);

export default function CategoryPageLayout({
  title,
  description,
  products,
  showCategoryFilter = true,
  emptyMessage,
  extra,
}: {
  title: string;
  description: string;
  products: Product[];
  showCategoryFilter?: boolean;
  emptyMessage?: string;
  extra?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-fairy-ink sm:text-3xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-fairy-ink/60">{description}</p>
      </header>
      <div className="mb-6">
        <Suspense fallback={FILTER_BAR_FALLBACK}>
          <ProductFilterBar showCategory={showCategoryFilter} />
        </Suspense>
      </div>
      {extra}
      <p className="mb-3 text-xs font-medium text-fairy-ink/50">{products.length} item{products.length === 1 ? "" : "s"}</p>
      <ProductGrid products={products} emptyMessage={emptyMessage} />
    </div>
  );
}
