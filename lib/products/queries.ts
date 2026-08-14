import { supabase } from "@/lib/supabase/client";
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
    slug: row.slug,
    artist: row.artist,
    productName: row.product_name,
    category: row.category as ProductCategory,
    version: row.version,
    pricePHP: row.price_php,
    originalPricePHP: row.original_price_php,
    stockStatus: row.stock_status as StockStatus,
    preorderStatus: row.preorder_status,
    releaseDate: row.release_date,
    shortDescription: row.short_description,
    tags: row.tags ?? [],
    featured: row.featured,
    bestseller: row.bestseller,
    newRelease: row.new_release,
    imageUrl: row.image_url,
    sourceUrl: row.source_url,
    dispatchNote: row.dispatch_note,
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
  if (filters.preorderOnly) query = query.eq("stock_status", "Preorder");
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

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Failed to load product "${slug}": ${error.message}`);
  return data ? mapRow(data as ProductRow) : null;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return getAllProducts({ query: undefined }).then((all) => all.filter((p) => p.featured).slice(0, limit));
}

export async function getBestsellers(limit = 8): Promise<Product[]> {
  return getAllProducts().then((all) => all.filter((p) => p.bestseller).slice(0, limit));
}

export async function getNewReleases(limit = 12): Promise<Product[]> {
  return getAllProducts().then((all) => {
    // Filter for new releases
    const newReleases = all.filter((p) => p.newRelease);
    
    // Sort by availability priority: In Stock > Preorder > Sold Out
    const sorted = newReleases.sort((a, b) => {
      const statusOrder = { "In Stock": 0, "Preorder": 1, "Sold Out": 2 };
      const aOrder = statusOrder[a.stockStatus as keyof typeof statusOrder] ?? 3;
      const bOrder = statusOrder[b.stockStatus as keyof typeof statusOrder] ?? 3;
      if (aOrder !== bOrder) return aOrder - bOrder;
      // Within same status, preserve release_date order (newest first)
      return 0;
    });
    
    return sorted.slice(0, limit);
  });
}

export async function getPreorders(limit?: number): Promise<Product[]> {
  const all = await getAllProducts({ availability: "Preorder" });
  return limit ? all.slice(0, limit) : all;
}

export async function getHeroCarouselProducts(limit = 8): Promise<Product[]> {
  const all = await getAllProducts();
  
  // Separate by availability priority: In Stock > Preorder > Sold Out
  const inStock = all.filter((p) => p.stockStatus === "In Stock");
  const preorder = all.filter((p) => p.stockStatus === "Preorder");
  const soldOut = all.filter((p) => p.stockStatus === "Sold Out");
  
  // Sort each group by priority: bestseller > featured > newRelease
  const prioritySort = (a: Product, b: Product) => {
    if (a.bestseller !== b.bestseller) return b.bestseller ? 1 : -1;
    if (a.featured !== b.featured) return b.featured ? 1 : -1;
    if (a.newRelease !== b.newRelease) return b.newRelease ? 1 : -1;
    return 0;
  };
  
  const inStockSorted = inStock.sort(prioritySort);
  const preorderSorted = preorder.sort(prioritySort);
  const soldOutSorted = soldOut.sort(prioritySort);
  
  // Combine in priority order: In Stock > Preorder > Sold Out
  const result = [...inStockSorted, ...preorderSorted, ...soldOutSorted].slice(0, limit);
  return result.length > 0 ? result : [];
}

export async function getSoldOut(limit?: number): Promise<Product[]> {
  const all = await getAllProducts({ availability: "Sold Out" });
  return limit ? all.slice(0, limit) : all;
}

export async function getByCategoryGroup(group: keyof typeof CATEGORY_GROUPS, filters: ProductFilters = {}) {
  return getAllProducts({ ...filters, category: CATEGORY_GROUPS[group] });
}
