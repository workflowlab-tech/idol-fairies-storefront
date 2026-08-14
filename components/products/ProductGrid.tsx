import type { Product } from "@/types/product";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products, emptyMessage = "No products match these filters yet." }: { products: Product[]; emptyMessage?: string }) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-fairy-pink-200 bg-fairy-pink-50/50 p-10 text-center text-sm text-fairy-ink/60">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
