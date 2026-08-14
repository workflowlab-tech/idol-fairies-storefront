import type { Product, ProductCategory } from "@/types/product";
import { categorySlug } from "./format";
import { supabase } from "@/lib/supabase/client";

/**
 * Real product photos live in Supabase Storage (bucket `product-images`,
 * uploaded by scripts/populate-real-images.ts from each product's own
 * source_url — see that script for how matches are verified). We don't
 * store a multi-image array on the `products` row itself (no schema change
 * needed): `image_url` holds the first verified image.
 *
 * Additional verified images sit alongside it as `{slug}/2.ext`,
 * `{slug}/3.ext`. Supabase's "public" bucket flag allows anonymous
 * GET-by-path but NOT anonymous listing (that needs a separate RLS policy
 * — another SQL step we're avoiding), so each folder also gets a
 * `manifest.json` (written by scripts/generate-image-manifests.ts) that we
 * fetch directly by path instead of listing.
 *
 * Products with no real image_url yet fall back to honest, clearly-labeled
 * branded placeholders (public/placeholders/) — never a fabricated photo.
 */
const PLACEHOLDER_VARIANTS = ["front", "package", "detail"] as const;
const STORAGE_BUCKET = "product-images";

function placeholderImages(category: ProductCategory): string[] {
  const slug = categorySlug(category);
  return PLACEHOLDER_VARIANTS.map((variant) => `/placeholders/${slug}-${variant}.svg`);
}

function publicUrl(path: string): string {
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Synchronous — safe for product listing cards, which only need the primary image. */
export function getProductPrimaryImage(product: Pick<Product, "imageUrl" | "category">): string {
  if (product.imageUrl) return product.imageUrl;
  return placeholderImages(product.category)[0];
}

/**
 * Full gallery for the product detail page. Async: for a product with a
 * real image_url, fetches its manifest.json to pick up any additional
 * verified images (2.ext, 3.ext) beyond the primary one.
 */
export async function getProductGalleryImages(
  product: Pick<Product, "imageUrl" | "category" | "slug">
): Promise<string[]> {
  if (!product.imageUrl) return placeholderImages(product.category);
  if (!product.imageUrl.includes(`/storage/v1/object/public/${STORAGE_BUCKET}/`)) {
    // Real image but not one of ours (shouldn't happen today, but don't
    // break if a URL is ever set some other way) — just show it alone.
    return [product.imageUrl];
  }

  try {
    const res = await fetch(publicUrl(`${product.slug}/manifest.json`), { next: { revalidate: 3600 } });
    if (!res.ok) return [product.imageUrl];
    const fileNames: string[] = await res.json();
    const urls = fileNames.map((name) => publicUrl(`${product.slug}/${name}`));
    return urls.length > 0 ? urls : [product.imageUrl];
  } catch {
    return [product.imageUrl];
  }
}
