import type { Metadata } from "next";
import { getByCategoryGroup } from "@/lib/products/queries";
import { filtersFromSearchParams, type SearchParams } from "@/lib/products/filters";
import CategoryPageLayout from "@/components/products/CategoryPageLayout";

export const metadata: Metadata = { title: "Light Sticks" };

export default async function LightSticksPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = filtersFromSearchParams(await searchParams);
  const products = await getByCategoryGroup("light-sticks", filters);

  return (
    <CategoryPageLayout
      title="Light Sticks"
      description="Official fan light sticks (bongs) for concerts, fan meets, and everyday fandom pride."
      products={products}
      showCategoryFilter={false}
    />
  );
}
