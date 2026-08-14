import type { Metadata } from "next";
import { getPreorders } from "@/lib/products/queries";
import CategoryPageLayout from "@/components/products/CategoryPageLayout";

export const metadata: Metadata = { title: "Preorders" };

export default async function PreordersPage() {
  const products = await getPreorders();

  return (
    <CategoryPageLayout
      title="Preorders"
      description="Reserve upcoming releases ahead of their dispatch date. Preorder items ship once stock arrives from the source."
      products={products}
      emptyMessage="Nothing is on preorder right now — check New Releases instead."
    />
  );
}
