import type { Metadata } from "next";
import { getAllProducts } from "@/lib/products/queries";
import { filtersFromSearchParams, type SearchParams } from "@/lib/products/filters";
import CategoryPageLayout from "@/components/products/CategoryPageLayout";

export const metadata: Metadata = { title: "Shop All Products" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = filtersFromSearchParams(await searchParams);
  const products = await getAllProducts(filters);

  return (
    <CategoryPageLayout
      title="Shop All Products"
      description="Browse the full Idol Fairies PH catalog — albums, light sticks, photobooks, magazines, and collectables."
      products={products}
    />
  );
}
