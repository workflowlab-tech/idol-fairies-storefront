import type { Metadata } from "next";
import { getByCategoryGroup } from "@/lib/products/queries";
import { filtersFromSearchParams, type SearchParams } from "@/lib/products/filters";
import CategoryPageLayout from "@/components/products/CategoryPageLayout";

export const metadata: Metadata = { title: "Albums" };

export default async function AlbumsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = filtersFromSearchParams(await searchParams);
  const products = await getByCategoryGroup("albums", filters);

  return (
    <CategoryPageLayout
      title="Albums"
      description="Physical K-pop albums — the latest comebacks, past releases, and every available version."
      products={products}
      showCategoryFilter={false}
    />
  );
}
