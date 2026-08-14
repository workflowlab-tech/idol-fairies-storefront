import type { Metadata } from "next";
import { getNewReleases } from "@/lib/products/queries";
import CategoryPageLayout from "@/components/products/CategoryPageLayout";

export const metadata: Metadata = { title: "New Releases" };

export default async function NewReleasesPage() {
  const products = await getNewReleases(200);

  return (
    <CategoryPageLayout
      title="New Releases"
      description="Everything freshly added to the Idol Fairies PH catalog."
      products={products}
      emptyMessage="No new releases flagged right now — check back soon."
    />
  );
}
