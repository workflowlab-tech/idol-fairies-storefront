/**
 * One-off migration: replace branded placeholders with REAL, verified
 * product images sourced from each product's own `source_url`.
 *
 * K PLACE (kplaceshop.com) products expose a Shopify `.json` endpoint with
 * the full product title, variant list, and image gallery (including
 * per-variant `image_id` for products whose cover/appearance differs by
 * version, e.g. magazine A/B/C covers). We:
 *   1. Fetch {source_url}.json
 *   2. Verify the fetched title actually matches our DB artist/product_name
 *      (token-overlap check) — refuse to use anything that doesn't match.
 *   3. If the product has variant-specific images (different images tied to
 *      different options), try to match our DB `version` field to the
 *      correct Shopify variant and use ONLY that variant's image + any
 *      variant-agnostic images. If we can't confidently match the variant,
 *      we do NOT guess — the product is left on its placeholder and
 *      reported as unverified, per "never assign a weakly matched image."
 *   4. Otherwise (one shared image set for the whole product) we use up to
 *      the first 3 gallery images.
 *   5. Download each selected image and upload it to Supabase Storage
 *      (bucket `product-images`, path `{slug}/{n}.{ext}`), then set
 *      `products.image_url` to the first uploaded image's public URL.
 *      ONLY `image_url` is ever written — nothing else on the row changes.
 *
 * Ktown4u-sourced rows are skipped here — their source_url is a generic
 * listing page, not a specific product page, and ktown4u.com blocks
 * automated requests (confirmed: it redirects to /accessRestriction for
 * non-browser traffic). Those are handled/reported separately.
 *
 * Safe to re-run: an already-populated image_url (pointing at our own
 * Storage bucket) is left alone unless --force is passed.
 *
 * Run with: npx tsx --env-file=.env.local scripts/populate-real-images.ts
 */
import { createServiceRoleClient } from "../lib/supabase/server";

const STORAGE_BUCKET = "product-images";
const FORCE = process.argv.includes("--force");

type ShopifyVariant = {
  option1: string | null;
  option2: string | null;
  option3: string | null;
  image_id: number | null;
};
type ShopifyImage = { id: number; src: string; variant_ids: number[] };
type ShopifyProduct = {
  title: string;
  handle: string;
  images: ShopifyImage[];
  image: { src: string } | null;
  variants: ShopifyVariant[];
};

type ProductRow = {
  id: number;
  slug: string;
  artist: string;
  product_name: string;
  version: string | null;
  category: string;
  source_url: string | null;
  image_url: string | null;
};

type Result = {
  slug: string;
  status: "uploaded" | "skipped-existing" | "unverified" | "no-match" | "fetch-failed" | "no-source" | "not-kplace";
  imageCount: number;
  reason?: string;
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\[\]().,\/&:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenOverlapRatio(a: string, b: string): number {
  const aTokens = new Set(normalize(a).split(" ").filter((t) => t.length > 2));
  const bTokens = new Set(normalize(b).split(" ").filter((t) => t.length > 2));
  if (aTokens.size === 0) return 0;
  let overlap = 0;
  for (const t of aTokens) if (bTokens.has(t)) overlap += 1;
  return overlap / aTokens.size;
}

/** Does this Shopify product have images tied to specific variants (cover differs by option)? */
function hasVariantSpecificImages(product: ShopifyProduct): boolean {
  return product.images.some((img) => img.variant_ids && img.variant_ids.length > 0);
}

/**
 * Finds the ONE image_id that unambiguously corresponds to `dbVersion`.
 *
 * A Shopify option string like "Album Only" can substring-match several
 * variants that each carry a DIFFERENT cover image (Album Only × THIS Ver.,
 * Album Only × THAT Ver., Album Only × 2 Set Package) — that's a genuine
 * ambiguity, not a match. So instead of picking "best single variant", we
 * collect the DISTINCT image_ids among every variant whose option text
 * contains (or is contained by) dbVersion, and only trust the result when
 * exactly one distinct image_id comes out the other end.
 */
function findUnambiguousVariantImageId(product: ShopifyProduct, dbVersion: string | null): number | null {
  if (!dbVersion) return null;
  const normVersion = normalize(dbVersion);
  if (!normVersion) return null;

  const matchedImageIds = new Set<number>();
  for (const variant of product.variants) {
    if (!variant.image_id) continue;
    const optionText = [variant.option1, variant.option2, variant.option3].filter(Boolean).join(" ");
    if (!optionText) continue;
    const normOption = normalize(optionText);
    if (normOption === normVersion || normOption.includes(normVersion) || normVersion.includes(normOption)) {
      matchedImageIds.add(variant.image_id);
    }
  }
  return matchedImageIds.size === 1 ? [...matchedImageIds][0] : null;
}

function extFromContentType(contentType: string | null): string {
  if (!contentType) return "jpg";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("png")) return "png";
  return "jpg";
}

async function uploadImage(
  supabase: ReturnType<typeof createServiceRoleClient>,
  url: string,
  slug: string,
  index: number
): Promise<{ publicUrl: string; fileName: string } | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  const contentType = res.headers.get("content-type");
  const buffer = Buffer.from(await res.arrayBuffer());
  const ext = extFromContentType(contentType);
  const fileName = `${index}.${ext}`;
  const path = `${slug}/${fileName}`;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, buffer, {
    contentType: contentType ?? "image/jpeg",
    upsert: true,
  });
  if (error) {
    console.error(`  upload failed for ${path}:`, error.message);
    return null;
  }
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { publicUrl: data.publicUrl, fileName };
}

async function processProduct(
  supabase: ReturnType<typeof createServiceRoleClient>,
  product: ProductRow,
  sharedUrlCounts: Map<string, number>
): Promise<Result> {
  if (!product.source_url) return { slug: product.slug, status: "no-source", imageCount: 0 };
  if (!product.source_url.includes("kplaceshop.com")) {
    return { slug: product.slug, status: "not-kplace", imageCount: 0 };
  }
  if (!FORCE && product.image_url && product.image_url.includes(STORAGE_BUCKET)) {
    return { slug: product.slug, status: "skipped-existing", imageCount: 0 };
  }

  let shopify: ShopifyProduct;
  try {
    const res = await fetch(`${product.source_url}.json`);
    if (!res.ok) return { slug: product.slug, status: "fetch-failed", imageCount: 0, reason: `HTTP ${res.status}` };
    const json = await res.json();
    shopify = json.product;
  } catch (err) {
    return { slug: product.slug, status: "fetch-failed", imageCount: 0, reason: (err as Error).message };
  }

  if (!shopify || !shopify.images) {
    return { slug: product.slug, status: "fetch-failed", imageCount: 0, reason: "malformed response" };
  }

  // Sanity check: does the fetched product actually correspond to our row?
  const matchRatio = tokenOverlapRatio(product.product_name, shopify.title);
  if (matchRatio < 0.4) {
    return {
      slug: product.slug,
      status: "unverified",
      imageCount: 0,
      reason: `title mismatch: DB="${product.product_name}" vs source="${shopify.title}" (overlap ${matchRatio.toFixed(2)})`,
    };
  }

  // A source_url shared by multiple DB rows (e.g. one magazine listing that
  // covers our separate "A Ver."/"B Ver."/"C Ver." rows) means the fetched
  // page represents several of our products at once — we must pick the
  // cover matching THIS row's version, or refuse. A source_url used by only
  // ONE DB row is already version-specific (its own dedicated page, title
  // already matched above) — no variant drilling needed, its default image
  // and gallery already belong to exactly this product.
  const isSharedAcrossRows = (sharedUrlCounts.get(product.source_url) ?? 0) > 1;

  let candidateImages: ShopifyImage[];

  if (isSharedAcrossRows && hasVariantSpecificImages(shopify)) {
    const imageId = findUnambiguousVariantImageId(shopify, product.version);
    if (!imageId) {
      return {
        slug: product.slug,
        status: "unverified",
        imageCount: 0,
        reason: `source page is shared across versions with variant-specific covers, and version "${product.version}" didn't map to exactly one cover image`,
      };
    }
    const primary = shopify.images.find((img) => img.id === imageId);
    if (!primary) {
      return { slug: product.slug, status: "unverified", imageCount: 0, reason: "matched variant has no linked image" };
    }
    // Extra images: same-variant or variant-agnostic only — never a different variant's image.
    const extras = shopify.images.filter(
      (img) => img.id !== primary.id && (img.variant_ids.length === 0 || img.variant_ids.includes(imageId))
    );
    candidateImages = [primary, ...extras];
  } else {
    candidateImages = shopify.images;
  }

  candidateImages = candidateImages.slice(0, 3);
  if (candidateImages.length === 0) {
    return { slug: product.slug, status: "no-match", imageCount: 0, reason: "no images on source product" };
  }

  const uploaded: Array<{ publicUrl: string; fileName: string }> = [];
  for (let i = 0; i < candidateImages.length; i++) {
    const result = await uploadImage(supabase, candidateImages[i].src, product.slug, i + 1);
    if (result) uploaded.push(result);
  }

  if (uploaded.length === 0) {
    return { slug: product.slug, status: "fetch-failed", imageCount: 0, reason: "all image downloads/uploads failed" };
  }

  // manifest.json lets the public app discover images 2/3 without needing
  // Storage LIST permission (the public bucket flag only covers GET-by-path).
  const manifest = JSON.stringify(uploaded.map((u) => u.fileName));
  const { error: manifestError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(`${product.slug}/manifest.json`, Buffer.from(manifest), { contentType: "application/json", upsert: true });
  if (manifestError) console.error(`  manifest upload failed for ${product.slug}:`, manifestError.message);

  const { error: updateError } = await supabase
    .from("products")
    .update({ image_url: uploaded[0].publicUrl })
    .eq("id", product.id);
  if (updateError) {
    return { slug: product.slug, status: "fetch-failed", imageCount: 0, reason: `DB update failed: ${updateError.message}` };
  }

  return { slug: product.slug, status: "uploaded", imageCount: uploaded.length };
}

async function main() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("products")
    .select("id,slug,artist,product_name,version,category,source_url,image_url");
  if (error) throw new Error(`Failed to load products: ${error.message}`);
  const allProducts = data as ProductRow[];

  // Shared-URL counts must reflect the FULL catalog, computed before any
  // --limit/--slugs test filtering below, or a partial run would wrongly
  // treat a shared page as dedicated.
  const sharedUrlCounts = new Map<string, number>();
  for (const p of allProducts) {
    if (!p.source_url) continue;
    sharedUrlCounts.set(p.source_url, (sharedUrlCounts.get(p.source_url) ?? 0) + 1);
  }

  let products = allProducts;
  const slugsArg = process.argv.find((a) => a.startsWith("--slugs="));
  if (slugsArg) {
    const wanted = new Set(slugsArg.split("=")[1].split(","));
    products = products.filter((p) => wanted.has(p.slug));
  }
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  if (limitArg) products = products.slice(0, Number(limitArg.split("=")[1]));

  console.log(`Loaded ${products.length} products (of ${allProducts.length} total). Processing K PLACE (Shopify) sources...`);

  const results: Result[] = [];
  let done = 0;
  for (const product of products) {
    const result = await processProduct(supabase, product, sharedUrlCounts);
    results.push(result);
    done += 1;
    if (result.status === "uploaded") {
      console.log(`[${done}/${products.length}] ✓ ${product.slug} — ${result.imageCount} image(s)`);
    } else if (result.status !== "not-kplace") {
      console.log(`[${done}/${products.length}] ✗ ${product.slug} — ${result.status}${result.reason ? `: ${result.reason}` : ""}`);
    }
  }

  const byStatus = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  console.log("\n=== Summary ===");
  console.log(byStatus);
  console.log(
    "\nUnverified/failed detail:\n" +
      results
        .filter((r) => r.status !== "uploaded" && r.status !== "not-kplace" && r.status !== "skipped-existing")
        .map((r) => `  ${r.slug}: ${r.status}${r.reason ? ` — ${r.reason}` : ""}`)
        .join("\n")
  );
}

main().catch((err) => {
  console.error("[populate-real-images] failed:", err);
  process.exit(1);
});
