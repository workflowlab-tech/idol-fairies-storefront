import type { Metadata } from "next";
import { getSoldOut } from "@/lib/products/queries";
import CategoryPageLayout from "@/components/products/CategoryPageLayout";

export const metadata: Metadata = { title: "Sold Out" };

export default async function SoldOutPage() {
  const products = await getSoldOut();

  return (
    <CategoryPageLayout
      title="Sold Out"
      description="These items are currently unavailable. Ask Idol AI if a restock is expected."
      products={products}
      emptyMessage="Nothing is sold out right now."
    />
  );
}
