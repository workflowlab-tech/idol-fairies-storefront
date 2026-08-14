import type { Metadata } from "next";
import { getAllProducts } from "@/lib/products/queries";
import { filtersFromSearchParams, type SearchParams } from "@/lib/products/filters";
import CategoryPageLayout from "@/components/products/CategoryPageLayout";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolved = await searchParams;
  const filters = filtersFromSearchParams(resolved);
  const hasQuery = Object.keys(filters).length > 0;
  const products = hasQuery ? await getAllProducts(filters) : [];

  return (
    <CategoryPageLayout
      title="Search"
      description="Search by artist, product name, category, availability, or price."
      products={products}
      emptyMessage={hasQuery ? "No products match your search." : "Enter a search above to find products."}
    />
  );
}
