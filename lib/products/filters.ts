import type { ProductCategory, ProductFilters, StockStatus } from "@/types/product";

export type SearchParams = Record<string, string | string[] | undefined>;
export type ProductSort = "newest" | "price-asc" | "price-desc" | "artist-asc";

export const PRODUCT_PAGE_SIZE = 24;

const VALID_SORTS: ProductSort[] = ["newest", "price-asc", "price-desc", "artist-asc"];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const VALID_STOCK_STATUS: StockStatus[] = ["In Stock", "Sold Out"];

/** Builds ProductFilters from a Next.js page's `searchParams`. */
export function filtersFromSearchParams(searchParams: SearchParams): ProductFilters {
  const filters: ProductFilters = {};

  const q = first(searchParams.q);
  if (q) filters.query = q;

  const artist = first(searchParams.artist);
  if (artist) filters.artist = artist;

  const category = first(searchParams.category);
  if (category) filters.category = category as ProductCategory;

  const availability = first(searchParams.availability);
  if (availability && VALID_STOCK_STATUS.includes(availability as StockStatus)) {
    filters.availability = availability as StockStatus;
  }

  const minPrice = first(searchParams.minPrice);
  if (minPrice && !Number.isNaN(Number(minPrice))) filters.minPrice = Number(minPrice);

  const maxPrice = first(searchParams.maxPrice);
  if (maxPrice && !Number.isNaN(Number(maxPrice))) filters.maxPrice = Number(maxPrice);

  return filters;
}

export function catalogOptionsFromSearchParams(searchParams: SearchParams) {
  const pageValue = Number(first(searchParams.page));
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const sortValue = first(searchParams.sort) as ProductSort | undefined;
  const sort = sortValue && VALID_SORTS.includes(sortValue) ? sortValue : "newest";

  return { page, pageSize: PRODUCT_PAGE_SIZE, sort };
}
