/** Raw row shape from the Supabase `products` table (read-only, single source of truth). */
export type ProductRow = {
  id: number;
  sku: string | null;
  slug: string;
  artist: string;
  product_name: string;
  category: string;
  version: string | null;
  price_php: number;
  original_price_php: number | null;
  stock_status: string;
  release_date: string | null;
  short_description: string | null;
  tags: string[] | null;
  featured: boolean;
  bestseller: boolean;
  new_release: boolean;
  image_url: string | null;
  source_url: string | null;
  source_price: number | null;
  dispatch_note: string | null;
  created_at: string;
  is_active: boolean;
};

export type StockStatus = "In Stock" | "Sold Out";

/** Categories as stored in the DB. */
export type ProductCategory =
  | "Album"
  | "Light Stick"
  | "Magazine"
  | "DICON"
  | "Photobook"
  | "Collectable";

/** Single source of truth for "all categories" — reused by filters and chat tool schemas. */
export const PRODUCT_CATEGORIES: ProductCategory[] = ["Album", "Light Stick", "Magazine", "DICON", "Photobook", "Collectable"];

/** App-facing camelCase Product, mapped from ProductRow in lib/products/queries.ts. */
export type Product = {
  id: number;
  sku: string | null;
  slug: string;
  artist: string;
  productName: string;
  category: ProductCategory;
  version: string | null;
  pricePHP: number;
  originalPricePHP: number | null;
  stockStatus: StockStatus;
  releaseDate: string | null;
  shortDescription: string | null;
  tags: string[];
  featured: boolean;
  bestseller: boolean;
  newRelease: boolean;
  imageUrl: string | null;
  sourceUrl: string | null;
  dispatchNote: string | null;
  isActive: boolean;
};

export type ProductFilters = {
  artist?: string;
  category?: ProductCategory | ProductCategory[];
  availability?: StockStatus;
  newRelease?: boolean;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
};
