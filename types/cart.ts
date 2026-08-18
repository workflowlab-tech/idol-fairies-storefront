import type { ProductCategory } from "@/types/product";

export type CartItem = {
  slug: string;
  productName: string;
  artist: string;
  version: string | null;
  category: ProductCategory;
  imageUrl: string | null;
  pricePHP: number;
  quantity: number;
};
