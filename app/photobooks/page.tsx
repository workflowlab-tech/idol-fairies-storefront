import type { Metadata } from "next";
import { getByCategoryGroup } from "@/lib/products/queries";
import { filtersFromSearchParams, type SearchParams } from "@/lib/products/filters";
import CategoryPageLayout from "@/components/products/CategoryPageLayout";

export const metadata: Metadata = { title: "Photobooks & Magazines" };

export default async function PhotobooksPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = filtersFromSearchParams(await searchParams);
  const products = await getByCategoryGroup("photobooks", filters);

  return (
    <CategoryPageLayout
      title="Photobooks & Magazines"
      description="Photobooks, DICON cards and mini-magazines, and idol magazine covers/features."
      products={products}
      showCategoryFilter={false}
    />
  );
}
