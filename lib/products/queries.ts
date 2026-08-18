import { supabase } from "@/lib/supabase/client";
import type { ProductSort } from "@/lib/products/filters";
import type { Product, ProductCategory, ProductFilters, ProductRow, StockStatus } from "@/types/product";

/** How the DB's `category` values map onto the storefront's nav groupings. */
export const CATEGORY_GROUPS: Record<string, ProductCategory[]> = {
  albums: ["Album"],
  "light-sticks": ["Light Stick"],
  photobooks: ["Magazine", "DICON", "Photobook"],
};

function mapRow(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    slug: row.slug,
    artist: row.artist,
    productName: row.product_name,
    category: row.category as ProductCategory,
    version: row.version,
    pricePHP: row.price_php,
    originalPricePHP: row.original_price_php,
    stockStatus: row.stock_status as StockStatus,
    releaseDate: row.release_date,
    shortDescription: row.short_description,
    tags: row.tags ?? [],
    featured: row.featured,
    bestseller: row.bestseller,
    newRelease: row.new_release,
    imageUrl: row.image_url,
    sourceUrl: row.source_url,
    dispatchNote: row.dispatch_note,
    isActive: row.is_active,
  };
}

export async function getAllProducts(filters: ProductFilters = {}): Promise<Product[]> {
  let query = supabase.from("products").select("*");

  if (filters.artist) query = query.ilike("artist", `%${filters.artist}%`);
  if (filters.category) {
    const categories = Array.isArray(filters.category) ? filters.category : [filters.category];
    query = query.in("category", categories);
  }
  if (filters.availability) query = query.eq("stock_status", filters.availability);
  if (filters.newRelease !== undefined) query = query.eq("new_release", filters.newRelease);
  if (filters.minPrice !== undefined) query = query.gte("price_php", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price_php", filters.maxPrice);
  if (filters.query) {
    query = query.or(
      `product_name.ilike.%${filters.query}%,artist.ilike.%${filters.query}%,short_description.ilike.%${filters.query}%`
    );
  }

  const { data, error } = await query.order("release_date", { ascending: false, nullsFirst: false });
  if (error) throw new Error(`Failed to load products: ${error.message}`);
  return (data as ProductRow[]).map(mapRow);
}

export type ProductPage = {
  products: Product[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getProductPage(
  filters: ProductFilters,
  options: { page: number; pageSize: number; sort: ProductSort }
): Promise<ProductPage> {
  const requestedPage = Math.max(1, options.page);

  function buildQuery() {
    let query = supabase.from("products").select("*", { count: "exact" });

    if (filters.artist) query = query.ilike("artist", `%${filters.artist}%`);
    if (filters.category) {
      const categories = Array.isArray(filters.category) ? filters.category : [filters.category];
      query = query.in("category", categories);
    }
    if (filters.availability) query = query.eq("stock_status", filters.availability);
    if (filters.newRelease !== undefined) query = query.eq("new_release", filters.newRelease);
    if (filters.minPrice !== undefined) query = query.gte("price_php", filters.minPrice);
    if (filters.maxPrice !== undefined) query = query.lte("price_php", filters.maxPrice);
    if (filters.query) {
      query = query.or(
        `product_name.ilike.%${filters.query}%,artist.ilike.%${filters.query}%,short_description.ilike.%${filters.query}%`
      );
    }

    switch (options.sort) {
      case "price-asc":
        return query.order("price_php", { ascending: true }).order("id", { ascending: false });
      case "price-desc":
        return query.order("price_php", { ascending: false }).order("id", { ascending: false });
      case "artist-asc":
        return query
          .order("artist", { ascending: true })
          .order("product_name", { ascending: true })
          .order("id", { ascending: false });
      default:
        return query.order("created_at", { ascending: false }).order("id", { ascending: false });
    }
  }

  async function fetchPage(page: number) {
    const from = (page - 1) * options.pageSize;
    return buildQuery().range(from, from + options.pageSize - 1);
  }

  let result = await fetchPage(requestedPage);
  if (result.error) throw new Error(`Failed to load products: ${result.error.message}`);

  const totalItems = result.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / options.pageSize));
  const page = Math.min(requestedPage, totalPages);

  if (page !== requestedPage) {
    result = await fetchPage(page);
    if (result.error) throw new Error(`Failed to load products: ${result.error.message}`);
  }

  return {
    products: (result.data as ProductRow[]).map(mapRow),
    totalItems,
    page,
    pageSize: options.pageSize,
    totalPages,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Failed to load product "${slug}": ${error.message}`);
  return data ? mapRow(data as ProductRow) : null;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", product.category)
    .neq("id", product.id)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to load related products: ${error.message}`);
  return (data as ProductRow[]).map(mapRow);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const all = await getAllProducts();
  const available = all.filter((p) => p.stockStatus === "In Stock");
  const flagged = available.filter((p) => p.featured);
  // Falls back to a selection of available products when nothing is explicitly
  // flagged featured, so this section always has real catalog content to show.
  const rest = available.filter((p) => !p.featured);
  return [...flagged, ...rest].slice(0, limit);
}

export async function getBestsellers(limit = 8): Promise<Product[]> {
  return getAllProducts().then((all) => all.filter((p) => p.bestseller).slice(0, limit));
}

export async function getNewReleases(limit = 12): Promise<Product[]> {
  return getAllProducts().then((all) => {
    // Filter for new releases
    const newReleases = all.filter((p) => p.newRelease);

    // Sort by availability priority: In Stock > Sold Out
    const sorted = newReleases.sort((a, b) => {
      const statusOrder = { "In Stock": 0, "Sold Out": 1 };
      const aOrder = statusOrder[a.stockStatus as keyof typeof statusOrder] ?? 2;
      const bOrder = statusOrder[b.stockStatus as keyof typeof statusOrder] ?? 2;
      if (aOrder !== bOrder) return aOrder - bOrder;
      // Within same status, preserve release_date order (newest first)
      return 0;
    });

    return sorted.slice(0, limit);
  });
}

export async function getHeroCarouselProducts(limit = 8): Promise<Product[]> {
  const all = await getAllProducts();

  // Separate by availability priority: In Stock > Sold Out
  const inStock = all.filter((p) => p.stockStatus === "In Stock");
  const soldOut = all.filter((p) => p.stockStatus === "Sold Out");

  // Sort each group by priority: bestseller > featured > newRelease
  const prioritySort = (a: Product, b: Product) => {
    if (a.bestseller !== b.bestseller) return b.bestseller ? 1 : -1;
    if (a.featured !== b.featured) return b.featured ? 1 : -1;
    if (a.newRelease !== b.newRelease) return b.newRelease ? 1 : -1;
    return 0;
  };

  const inStockSorted = inStock.sort(prioritySort);
  const soldOutSorted = soldOut.sort(prioritySort);

  // Combine in priority order: In Stock > Sold Out
  const result = [...inStockSorted, ...soldOutSorted].slice(0, limit);
  return result.length > 0 ? result : [];
}

export async function getSoldOut(limit?: number): Promise<Product[]> {
  const all = await getAllProducts({ availability: "Sold Out" });
  return limit ? all.slice(0, limit) : all;
}

export async function getByCategoryGroup(group: keyof typeof CATEGORY_GROUPS, filters: ProductFilters = {}) {
  return getAllProducts({ ...filters, category: CATEGORY_GROUPS[group] });
}
